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
import { buildContractCall, getRandomBytes } from '../helpers';
import {
  BaseContracts,
  GnosisDAO,
  SafeTransaction,
  TokenGovernanceDAO,
  AzoriusContracts,
} from '../types';
import { TokenCreationType } from './../types/createDAO';
import { BaseTxBuilder } from './BaseTxBuilder';
import { generateContractByteCodeLinear, generateSalt, TIMER_MULT } from './helpers/utils';

export class AzoriusTxBuilder extends BaseTxBuilder {
  private readonly safeContract: GnosisSafe;
  private readonly predictedGnosisSafeAddress: string;

  private encodedSetupTokenData: string | undefined;
  private encodedSetupERC20WrapperData: string | undefined;
  private encodedStrategySetupData: string | undefined;
  private encodedSetupAzoriusData: string | undefined;
  private encodedSetupTokenClaimData: string | undefined;

  private predictedTokenAddress: string | undefined;
  private predictedStrategyAddress: string | undefined;
  private predictedAzoriusAddress: string | undefined;
  private predictedTokenClaimAddress: string | undefined;

  public azoriusContract: FractalUsul | undefined;
  public linearVotingContract: OZLinearVoting | undefined;
  public votesTokenContract: VotesToken | undefined;

  private tokenNonce: string;
  private strategyNonce: string;
  private azoriusNonce: string;
  private claimNonce: string;

  constructor(
    signerOrProvider: any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts,
    daoData: GnosisDAO | TokenGovernanceDAO,
    safeContract: GnosisSafe,
    predictedGnosisSafeAddress: string,
    parentAddress?: string,
    parentTokenAddress?: string
  ) {
    super(
      signerOrProvider,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress
    );

    this.safeContract = safeContract;
    this.predictedGnosisSafeAddress = predictedGnosisSafeAddress;
    this.tokenNonce = getRandomBytes();
    this.claimNonce = getRandomBytes();
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();

    const data = daoData as TokenGovernanceDAO;
    if (data.tokenCreationType === TokenCreationType.NEW) {
      this.setEncodedSetupTokenData();
      this.setPredictedTokenAddress();
    } else if (data.isTokenImported) {
      if (data.isVotesToken) {
        this.predictedTokenAddress = data.tokenImportAddress;
      } else {
        this.setEncodedSetupERC20WrapperData();
        this.setPredictedERC20WrapperAddress();
      }
    }

    this.setPredictedStrategyAddress();
    this.setPredictedAzoriusAddress();
    this.setContracts();

    if (parentTokenAddress && !data.parentAllocationAmount.isZero()) {
      this.setEncodedSetupTokenClaimData();
      this.setPredictedTokenClaimAddress();
    }
  }

  public buildLinearVotingContractSetupTx(): SafeTransaction {
    return buildContractCall(
      this.linearVotingContract!,
      'setUsul', // contract function name
      [this.azoriusContract!.address],
      0,
      false
    );
  }

  public buildEnableazoriusModuleTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'enableModule',
      [this.azoriusContract!.address],
      0,
      false
    );
  }

  public buildAddAzoriusContractAsOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'addOwnerWithThreshold',
      [this.azoriusContract!.address, 1],
      0,
      false
    );
  }

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'removeOwner',
      [this.azoriusContract!.address, this.baseContracts.multiSendContract.address, 1],
      0,
      false
    );
  }

  public buildCreateTokenTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.azoriusContracts!.votesTokenMasterCopyContract.address,
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
        this.azoriusContracts!.linearVotingMasterCopyContract.address,
        this.encodedStrategySetupData,
        this.strategyNonce,
      ],
      0,
      false
    );
  }

  public buildDeployAzoriusTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.azoriusContracts!.fractalAzoriusMasterCopyContract.address,
        this.encodedSetupAzoriusData,
        this.azoriusNonce,
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
        this.azoriusContracts!.claimingMasterCopyContract.address,
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

  public buildCreateTokenWrapperTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.azoriusContracts!.votesERC20WrapperMasterCopyContract.address,
        this.encodedSetupERC20WrapperData,
        this.tokenNonce,
      ],
      0,
      false
    );
  }

  public setEncodedSetupERC20WrapperData() {
    const { tokenImportAddress } = this.daoData as TokenGovernanceDAO;

    const encodedInitTokenData = defaultAbiCoder.encode(['address'], [tokenImportAddress!]);

    this.encodedSetupERC20WrapperData =
      this.azoriusContracts!.votesERC20WrapperMasterCopyContract.interface.encodeFunctionData(
        'setUp',
        [encodedInitTokenData]
      );
  }
  public setPredictedERC20WrapperAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.votesERC20WrapperMasterCopyContract.address.slice(2)
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenData!, this.tokenNonce);

    this.predictedTokenAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      tokenSalt,
      solidityKeccak256(['bytes'], [tokenByteCodeLinear])
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
      this.azoriusContracts!.votesTokenMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitTokenData,
      ]);
  }

  private setPredictedTokenAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.votesTokenMasterCopyContract.address.slice(2)
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
      this.azoriusContracts!.claimingMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitTokenData,
      ]);
  }

  private setPredictedTokenClaimAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.claimingMasterCopyContract.address.slice(2)
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
      this.azoriusContracts!.linearVotingMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedStrategyInitParams,
      ]);

    const strategyByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.linearVotingMasterCopyContract.address.slice(2)
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
  private setPredictedAzoriusAddress() {
    const encodedInitAzoriusData = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'address[]'],
      [
        this.safeContract.address,
        this.safeContract.address,
        this.safeContract.address,
        [this.predictedStrategyAddress],
      ]
    );

    const encodedSetupAzoriusData =
      this.azoriusContracts!.fractalAzoriusMasterCopyContract.interface.encodeFunctionData(
        'setUp',
        [encodedInitAzoriusData]
      );

    const azoriusByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.fractalAzoriusMasterCopyContract.address.slice(2)
    );
    const azoriusSalt = generateSalt(encodedSetupAzoriusData, this.azoriusNonce);

    this.encodedSetupAzoriusData = encodedSetupAzoriusData;
    this.predictedAzoriusAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      azoriusSalt,
      solidityKeccak256(['bytes'], [azoriusByteCodeLinear])
    );
  }

  private setContracts() {
    this.azoriusContract = FractalUsul__factory.connect(
      this.predictedAzoriusAddress!,
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
