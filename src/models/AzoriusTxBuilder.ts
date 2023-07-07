import {
  Azorius,
  Azorius__factory,
  GnosisSafe,
  LinearERC20Voting,
  LinearERC20Voting__factory,
  LinearERC721Voting,
  LinearERC721Voting__factory,
  VotesERC20,
  VotesERC20__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { buildContractCall, getRandomBytes } from '../helpers';
import {
  BaseContracts,
  SafeTransaction,
  AzoriusGovernanceDAO,
  AzoriusERC20DAO,
  AzoriusContracts,
  AzoriusERC721DAO,
  VotingStrategyType,
} from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { generateContractByteCodeLinear, generateSalt } from './helpers/utils';

export class AzoriusTxBuilder extends BaseTxBuilder {
  private readonly safeContract: GnosisSafe;
  private readonly predictedSafeAddress: string;

  private encodedSetupTokenData: string | undefined;
  private encodedSetupERC20WrapperData: string | undefined;
  private encodedStrategySetupData: string | undefined;
  private encodedSetupAzoriusData: string | undefined;
  private encodedSetupTokenClaimData: string | undefined;

  private predictedTokenAddress: string | undefined;
  private predictedStrategyAddress: string | undefined;
  private predictedAzoriusAddress: string | undefined;
  private predictedTokenClaimAddress: string | undefined;

  public azoriusContract: Azorius | undefined;
  public linearVotingContract: LinearERC20Voting | undefined;
  public linearERC721VotingContract: LinearERC721Voting | undefined;
  public votesTokenContract: VotesERC20 | undefined;

  private tokenNonce: string;
  private strategyNonce: string;
  private azoriusNonce: string;
  private claimNonce: string;

  constructor(
    signerOrProvider: any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts,
    daoData: AzoriusERC20DAO | AzoriusERC721DAO,
    safeContract: GnosisSafe,
    predictedSafeAddress: string,
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
    this.predictedSafeAddress = predictedSafeAddress;

    this.tokenNonce = getRandomBytes();
    this.claimNonce = getRandomBytes();
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();

    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      daoData = daoData as AzoriusERC20DAO;
      if (!daoData.isTokenImported) {
        this.setEncodedSetupTokenData();
        this.setPredictedTokenAddress();
      } else {
        if (daoData.isVotesToken) {
          this.predictedTokenAddress = daoData.tokenImportAddress;
        } else {
          this.setEncodedSetupERC20WrapperData();
          this.setPredictedERC20WrapperAddress();
        }
      }
    }

    this.setPredictedStrategyAddress();
    this.setPredictedAzoriusAddress();
    this.setContracts();

    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      daoData = daoData as AzoriusERC20DAO;
      if (
        parentTokenAddress &&
        daoData.parentAllocationAmount &&
        !daoData.parentAllocationAmount.isZero()
      ) {
        this.setEncodedSetupTokenClaimData();
        this.setPredictedTokenClaimAddress();
      }
    }
  }

  public buildRemoveOwners(owners: string[]): SafeTransaction[] {
    const removeOwnerTxs = owners.map(owner =>
      buildContractCall(
        this.safeContract!,
        'removeOwner',
        [this.baseContracts.multiSendContract.address, owner, 1],
        0,
        false
      )
    );
    return removeOwnerTxs;
  }

  public buildVotingContractSetupTx(): SafeTransaction {
    const daoData = this.daoData as AzoriusGovernanceDAO;
    return buildContractCall(
      daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20
        ? this.linearVotingContract!
        : this.linearERC721VotingContract!,
      'setAzorius', // contract function name
      [this.azoriusContract!.address],
      0,
      false
    );
  }

  public buildEnableAzoriusModuleTx(): SafeTransaction {
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
    const daoData = this.daoData as AzoriusGovernanceDAO;

    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20
          ? this.azoriusContracts!.linearVotingMasterCopyContract.address
          : this.azoriusContracts!.linearVotingERC721MasterCopyContract.address,
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
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    return buildContractCall(
      this.votesTokenContract!,
      'approve',
      [this.predictedTokenClaimAddress, azoriusGovernanceDaoData.parentAllocationAmount],
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
    const { tokenImportAddress } = this.daoData as AzoriusERC20DAO;

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

    const tokenSalt = generateSalt(this.encodedSetupERC20WrapperData!, this.tokenNonce);

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
    azoriusGovernanceDaoData: AzoriusERC20DAO
  ): [string[], BigNumber[]] {
    const tokenAllocationsOwners = azoriusGovernanceDaoData.tokenAllocations.map(
      tokenAllocation => tokenAllocation.address
    );
    const tokenAllocationsValues = azoriusGovernanceDaoData.tokenAllocations.map(
      tokenAllocation => tokenAllocation.amount || BigNumber.from(0)
    );
    const tokenAllocationSum = tokenAllocationsValues.reduce((accumulator, tokenAllocation) => {
      return tokenAllocation!.add(accumulator);
    }, BigNumber.from(0));

    // Send any un-allocated tokens to the Safe Treasury
    if (azoriusGovernanceDaoData.tokenSupply.gt(tokenAllocationSum)) {
      // TODO -- verify this doesn't need to be the predicted safe address (that they are the same)
      tokenAllocationsOwners.push(this.safeContract.address);
      tokenAllocationsValues.push(azoriusGovernanceDaoData.tokenSupply.sub(tokenAllocationSum));
    }

    return [tokenAllocationsOwners, tokenAllocationsValues];
  }

  private setEncodedSetupTokenData() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    const [tokenAllocationsOwners, tokenAllocationsValues] =
      this.calculateTokenAllocations(azoriusGovernanceDaoData);

    const encodedInitTokenData = defaultAbiCoder.encode(
      ['string', 'string', 'address[]', 'uint256[]'],
      [
        azoriusGovernanceDaoData.tokenName,
        azoriusGovernanceDaoData.tokenSymbol,
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
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    const encodedInitTokenData = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256'],
      [
        this.safeContract.address,
        this.parentTokenAddress,
        this.predictedTokenAddress,
        azoriusGovernanceDaoData.parentAllocationAmount,
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
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    if (azoriusGovernanceDaoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      const encodedStrategyInitParams = defaultAbiCoder.encode(
        ['address', 'address', 'address', 'uint32', 'uint256', 'uint256', 'uint256'],
        [
          this.safeContract.address, // owner
          this.predictedTokenAddress, // governance token
          '0x0000000000000000000000000000000000000001', // Azorius module
          azoriusGovernanceDaoData.votingPeriod,
          BigNumber.from(0), // proposer weight, how much is needed to create a proposal.
          azoriusGovernanceDaoData.quorumPercentage, // quorom numerator, denominator is 1,000,000, so quorum percentage is 50%
          BigNumber.from(500000), // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ]
      );

      const encodedStrategySetupData =
        this.azoriusContracts!.linearVotingMasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedStrategyInitParams]
        );

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
    } else if (azoriusGovernanceDaoData.votingStrategyType === VotingStrategyType.LINEAR_ERC721) {
      const daoData = azoriusGovernanceDaoData as AzoriusERC721DAO;

      const encodedStrategyInitParams = defaultAbiCoder.encode(
        ['address', 'address[]', 'uint256[]', 'address', 'uint32', 'uint256', 'uint256', 'uint256'],
        [
          this.safeContract.address, // owner
          daoData.nfts.map(nft => nft.tokenAddress), // governance tokens addresses
          daoData.nfts.map(nft => nft.tokenWeight), // governance tokens weights
          '0x0000000000000000000000000000000000000001', // Azorius module
          azoriusGovernanceDaoData.votingPeriod,
          daoData.quorumThreshold, // quorom threshold. Since smart contract can't know total of NFTs minted - we need to provide it manually
          BigNumber.from(0), // proposer weight, how much is needed to create a proposal.
          BigNumber.from(500000), // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ]
      );

      const encodedStrategySetupData =
        this.azoriusContracts!.linearVotingERC721MasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedStrategyInitParams]
        );

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        this.azoriusContracts!.linearVotingERC721MasterCopyContract.address.slice(2)
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
  }

  // TODO - verify we can use safe contract address
  private setPredictedAzoriusAddress() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    const encodedInitAzoriusData = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'address[]', 'uint32', 'uint32'],
      [
        this.safeContract.address,
        this.safeContract.address,
        this.safeContract.address,
        [this.predictedStrategyAddress],
        azoriusGovernanceDaoData.timelock, // timelock period in blocks
        azoriusGovernanceDaoData.executionPeriod, // execution period in blocks
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
    const daoData = this.daoData as AzoriusGovernanceDAO;
    this.azoriusContract = Azorius__factory.connect(
      this.predictedAzoriusAddress!,
      this.signerOrProvider
    );
    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      this.linearVotingContract = LinearERC20Voting__factory.connect(
        this.predictedStrategyAddress!,
        this.signerOrProvider
      );
      this.votesTokenContract = VotesERC20__factory.connect(
        this.predictedTokenAddress!,
        this.signerOrProvider
      );
    } else {
      this.linearERC721VotingContract = LinearERC721Voting__factory.connect(
        this.predictedStrategyAddress!,
        this.signerOrProvider
      );
    }
  }
}
