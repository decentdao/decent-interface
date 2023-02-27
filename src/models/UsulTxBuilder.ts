import {
  FractalUsul,
  FractalUsul__factory,
  GnosisSafe,
  OZLinearVoting,
  OZLinearVoting__factory,
  VotesToken,
  VotesToken__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { GnosisDAO, TokenGovernanceDAO } from '../components/DaoCreator/types';
import { buildContractCall, getRandomBytes } from '../helpers';
import { SafeTransaction } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { generateContractByteCodeLinear, generateSalt, TIMER_MULT } from './helpers/utils';
import { BaseContracts, UsulContracts } from './types/contracts';

export class UsulTxBuilder extends BaseTxBuilder {
  private readonly safeContract: GnosisSafe;
  private readonly predictedGnosisSafeAddress: string;

  private encodedSetupTokenData: string | undefined;
  private encodedStrategySetupData: string | undefined;
  private encodedSetupUsulData: string | undefined;
  private encodedSetupTokenClaimData: string | undefined;
  private encodedSetupTokenApprovalData: string | undefined;

  private predictedTokenAddress: string | undefined;
  private predictedStrategyAddress: string | undefined;
  private predictedUsulAddress: string | undefined;
  private predictedTokenClaimAddress: string | undefined;

  public usulContract: FractalUsul | undefined;
  public linearVotingContract: OZLinearVoting | undefined;
  public votesTokenContract: VotesToken | undefined;

  private tokenNonce: string;
  private strategyNonce: string;
  private usulNonce: string;
  private claimNonce: string;

  constructor(
    signerOrProvider: any,
    baseContracts: BaseContracts,
    usulContracts: UsulContracts,
    daoData: GnosisDAO | TokenGovernanceDAO,
    safeContract: GnosisSafe,
    predictedGnosisSafeAddress: string,
    parentDAOAddress?: string,
    parentTokenAddress?: string
  ) {
    super(
      signerOrProvider,
      baseContracts,
      usulContracts,
      daoData,
      parentDAOAddress,
      parentTokenAddress
    );

    this.safeContract = safeContract;
    this.predictedGnosisSafeAddress = predictedGnosisSafeAddress;
    this.tokenNonce = getRandomBytes();
    this.claimNonce = getRandomBytes();
    this.strategyNonce = getRandomBytes();
    this.usulNonce = getRandomBytes();

    this.setEncodedSetupTokenData();
    this.setPredictedTokenAddress();
    this.setPredictedStrategyAddress();
    this.setPredictedUsulAddress();
    this.setContracts();

    const data = daoData as TokenGovernanceDAO;
    if (parentTokenAddress && !data.parentAllocationAmount.isZero()) {
      this.setEncodedSetupTokenClaimData();
      this.setPredictedTokenClaimAddress();
    }
  }

  public buildLinearVotingContractSetupTx(): SafeTransaction {
    return buildContractCall(
      this.linearVotingContract!,
      'setUsul',
      [this.usulContract!.address],
      0,
      false
    );
  }

  public buildEnableUsulModuleTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'enableModule',
      [this.usulContract!.address],
      0,
      false
    );
  }

  public buildAddUsulContractAsOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'addOwnerWithThreshold',
      [this.usulContract!.address, 1],
      0,
      false
    );
  }

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'removeOwner',
      [this.usulContract!.address, this.baseContracts.multiSendContract.address, 1],
      0,
      false
    );
  }

  public buildCreateTokenTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.usulContracts!.votesTokenMasterCopyContract.address,
        this.encodedSetupTokenData,
        this.tokenNonce,
      ],
      0,
      false
    );
  }

  public buildDeployStrategyTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.usulContracts!.linearVotingMasterCopyContract.address,
        this.encodedStrategySetupData,
        this.strategyNonce,
      ],
      0,
      false
    );
  }

  public buildDeployUsulTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.usulContracts!.fractalUsulMasterCopyContract.address,
        this.encodedSetupUsulData,
        this.usulNonce,
      ],
      0,
      false
    );
  }

  public buildDeployTokenClaim() {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.usulContracts!.claimingMasterCopyContract.address,
        this.encodedSetupTokenClaimData,
        this.claimNonce,
      ],
      0,
      false
    );
  }

  public buildApproveClaimAllocation() {
    const tokenGovernanceDaoData = this.daoData as TokenGovernanceDAO;
    return buildContractCall(
      this.votesTokenContract!,
      'approve',
      [this.predictedTokenClaimAddress, tokenGovernanceDaoData.parentAllocationAmount],
      0,
      false
    );
  }

  public signatures = (): string => {
    return (
      '0x000000000000000000000000' +
      this.baseContracts.multiSendContract.address.slice(2) +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '01'
    );
  };

  private calculateTokenAllocations(
    tokenGovernanceDaoData: TokenGovernanceDAO
  ): [string[], BigNumber[]] {
    const tokenAllocationsOwners = tokenGovernanceDaoData.tokenAllocations.map(
      tokenAllocation => tokenAllocation.address
    );
    const tokenAllocationsValues = tokenGovernanceDaoData.tokenAllocations.map(
      tokenAllocation => tokenAllocation.amount || BigNumber.from(0)
    );
    const tokenAllocationSum = tokenAllocationsValues.reduce((accumulator, tokenAllocation) => {
      return tokenAllocation!.add(accumulator);
    }, BigNumber.from(0));

    // Send any un-allocated tokens to the Safe Treasury
    if (tokenGovernanceDaoData.tokenSupply.gt(tokenAllocationSum)) {
      // TODO -- verify this doesn't need to be the predicted safe address (that they are the same)
      tokenAllocationsOwners.push(this.safeContract.address);
      tokenAllocationsValues.push(tokenGovernanceDaoData.tokenSupply.sub(tokenAllocationSum));
    }

    return [tokenAllocationsOwners, tokenAllocationsValues];
  }

  private setEncodedSetupTokenData() {
    const tokenGovernanceDaoData = this.daoData as TokenGovernanceDAO;
    const [tokenAllocationsOwners, tokenAllocationsValues] =
      this.calculateTokenAllocations(tokenGovernanceDaoData);

    const encodedInitTokenData = defaultAbiCoder.encode(
      ['string', 'string', 'address[]', 'uint256[]'],
      [
        tokenGovernanceDaoData.tokenName,
        tokenGovernanceDaoData.tokenSymbol,
        tokenAllocationsOwners,
        tokenAllocationsValues,
      ]
    );

    this.encodedSetupTokenData =
      this.usulContracts!.votesTokenMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitTokenData,
      ]);
  }

  private setPredictedTokenAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.usulContracts!.votesTokenMasterCopyContract.address.slice(2)
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenData!, this.tokenNonce);

    this.predictedTokenAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      tokenSalt,
      solidityKeccak256(['bytes'], [tokenByteCodeLinear])
    );
  }

  private setEncodedSetupTokenClaimData() {
    const tokenGovernanceDaoData = this.daoData as TokenGovernanceDAO;
    const encodedInitTokenData = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256'],
      [
        this.safeContract.address,
        this.parentTokenAddress,
        this.predictedTokenAddress,
        tokenGovernanceDaoData.parentAllocationAmount,
      ]
    );
    this.encodedSetupTokenClaimData =
      this.usulContracts!.claimingMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitTokenData,
      ]);
  }

  private setPredictedTokenClaimAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.usulContracts!.claimingMasterCopyContract.address.slice(2)
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenClaimData!, this.claimNonce);

    this.predictedTokenClaimAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      tokenSalt,
      solidityKeccak256(['bytes'], [tokenByteCodeLinear])
    );
  }

  private setPredictedStrategyAddress() {
    const tokenGovernanceDaoData = this.daoData as TokenGovernanceDAO;

    // TODO - verify we can use safe contract address
    const encodedStrategyInitParams = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
      [
        this.safeContract.address, // owner
        this.predictedTokenAddress,
        '0x0000000000000000000000000000000000000001',
        tokenGovernanceDaoData.votingPeriod.mul(TIMER_MULT),
        tokenGovernanceDaoData.quorumPercentage,
        tokenGovernanceDaoData.timelock.mul(TIMER_MULT),
        'linearVoting',
      ]
    );

    const encodedStrategySetupData =
      this.usulContracts!.linearVotingMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedStrategyInitParams,
      ]);

    const strategyByteCodeLinear = generateContractByteCodeLinear(
      this.usulContracts!.linearVotingMasterCopyContract.address.slice(2)
    );

    const strategySalt = solidityKeccak256(
      ['bytes32', 'uint256'],
      [solidityKeccak256(['bytes'], [encodedStrategySetupData]), this.strategyNonce]
    );

    this.encodedStrategySetupData = encodedStrategySetupData;

    this.predictedStrategyAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      strategySalt,
      solidityKeccak256(['bytes'], [strategyByteCodeLinear])
    );
  }

  // TODO - verify we can use safe contract address
  private setPredictedUsulAddress() {
    const encodedInitUsulData = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'address[]'],
      [
        this.safeContract.address,
        this.safeContract.address,
        this.safeContract.address,
        [this.predictedStrategyAddress],
      ]
    );

    const encodedSetupUsulData =
      this.usulContracts!.fractalUsulMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitUsulData,
      ]);

    const usulByteCodeLinear = generateContractByteCodeLinear(
      this.usulContracts!.fractalUsulMasterCopyContract.address.slice(2)
    );
    const usulSalt = generateSalt(encodedSetupUsulData, this.usulNonce);

    this.encodedSetupUsulData = encodedSetupUsulData;
    this.predictedUsulAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      usulSalt,
      solidityKeccak256(['bytes'], [usulByteCodeLinear])
    );
  }

  private setContracts() {
    this.usulContract = FractalUsul__factory.connect(
      this.predictedUsulAddress!,
      this.signerOrProvider
    );
    this.linearVotingContract = OZLinearVoting__factory.connect(
      this.predictedStrategyAddress!,
      this.signerOrProvider
    );
    this.votesTokenContract = VotesToken__factory.connect(
      this.predictedTokenAddress!,
      this.signerOrProvider
    );
  }
}
