import {
  keccak256,
  encodePacked,
  getCreate2Address,
  encodeAbiParameters,
  parseAbiParameters,
  Hash,
  Address,
  WalletClient,
  PublicClient,
  encodeFunctionData,
} from 'viem';
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
import { NetworkContract } from '../types/network';
import { BaseTxBuilder } from './BaseTxBuilder';
import { generateContractByteCodeLinear, generateSalt } from './helpers/utils';

export class AzoriusTxBuilder extends BaseTxBuilder {
  private readonly safeContract: NetworkContract;
  private readonly predictedSafeAddress: Address;

  private encodedSetupTokenData: Hash | undefined;
  private encodedSetupERC20WrapperData: Hash | undefined;
  private encodedStrategySetupData: Hash | undefined;
  private encodedSetupAzoriusData: Hash | undefined;
  private encodedSetupTokenClaimData: Hash | undefined;

  public predictedTokenAddress: Address | undefined;
  public predictedStrategyAddress: Address | undefined;
  public predictedAzoriusAddress: Address | undefined;
  public predictedTokenClaimAddress: Address | undefined;

  private tokenNonce: bigint;
  private strategyNonce: bigint;
  private azoriusNonce: bigint;
  private claimNonce: bigint;

  constructor(
    walletOrPublicClient: WalletClient | PublicClient,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts,
    daoData: AzoriusERC20DAO | AzoriusERC721DAO,
    safeContract: NetworkContract,
    predictedSafeAddress: Address,
    parentAddress?: Address,
    parentTokenAddress?: Address,
  ) {
    super(
      walletOrPublicClient,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress,
    );

    this.safeContract = safeContract;
    this.predictedSafeAddress = predictedSafeAddress;

    this.tokenNonce = BigInt(getRandomBytes());
    this.claimNonce = BigInt(getRandomBytes());
    this.strategyNonce = BigInt(getRandomBytes());
    this.azoriusNonce = BigInt(getRandomBytes());

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
  }

  public async init() {
    await this.setPredictedStrategyAddress();
    this.setPredictedAzoriusAddress();

    if (
      (this.daoData as AzoriusERC20DAO | AzoriusERC721DAO).votingStrategyType ===
      VotingStrategyType.LINEAR_ERC20
    ) {
      const azoriusDAOData = this.daoData as AzoriusERC20DAO;
      if (
        this.parentTokenAddress &&
        azoriusDAOData.parentAllocationAmount &&
        azoriusDAOData.parentAllocationAmount !== 0n
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
        false,
      ),
    );
    return removeOwnerTxs;
  }

  public buildVotingContractSetupTx(): SafeTransaction {
    const daoData = this.daoData as AzoriusGovernanceDAO;
    return buildContractCall(
      {
        address: this.predictedStrategyAddress!,
        abi:
          daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20
            ? this.azoriusContracts!.linearVotingMasterCopyContract.abi
            : this.azoriusContracts!.linearVotingERC721MasterCopyContract.abi,
      },
      'setAzorius', // contract function name
      [this.predictedAzoriusAddress!],
      0,
      false,
    );
  }

  public buildEnableAzoriusModuleTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'enableModule',
      [this.predictedAzoriusAddress!],
      0,
      false,
    );
  }

  public buildAddAzoriusContractAsOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'addOwnerWithThreshold',
      [this.predictedAzoriusAddress!, 1],
      0,
      false,
    );
  }

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'removeOwner',
      [this.predictedAzoriusAddress!, this.baseContracts.multiSendContract.address, 1],
      0,
      false,
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
      false,
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
      false,
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
      false,
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
      false,
    );
  }

  public buildApproveClaimAllocation() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    return buildContractCall(
      {
        address: this.predictedTokenAddress!,
        abi: this.azoriusContracts!.votesTokenMasterCopyContract.abi,
      },
      'approve',
      [this.predictedTokenClaimAddress, azoriusGovernanceDaoData.parentAllocationAmount],
      0,
      false,
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
      false,
    );
  }

  public setEncodedSetupERC20WrapperData() {
    const { tokenImportAddress } = this.daoData as AzoriusERC20DAO;

    const encodedInitTokenData = encodeAbiParameters(parseAbiParameters('address'), [
      tokenImportAddress!,
    ]);

    this.encodedSetupERC20WrapperData = encodeFunctionData({
      abi: this.azoriusContracts!.votesERC20WrapperMasterCopyContract.abi,
      functionName: 'setUp',
      args: [encodedInitTokenData],
    });
  }

  public setPredictedERC20WrapperAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.votesERC20WrapperMasterCopyContract.address.slice(2) as Address,
    );

    const tokenSalt = generateSalt(this.encodedSetupERC20WrapperData!, this.tokenNonce);

    this.predictedTokenAddress = getCreate2Address({
      from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
      salt: tokenSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [tokenByteCodeLinear])),
    });
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
    azoriusGovernanceDaoData: AzoriusERC20DAO,
  ): [Address[], bigint[]] {
    const tokenAllocationsOwners = azoriusGovernanceDaoData.tokenAllocations.map(
      tokenAllocation => tokenAllocation.address,
    );
    const tokenAllocationsValues = azoriusGovernanceDaoData.tokenAllocations.map(
      tokenAllocation => tokenAllocation.amount || 0n,
    );
    const tokenAllocationSum = tokenAllocationsValues.reduce((accumulator, tokenAllocation) => {
      return tokenAllocation + accumulator;
    }, 0n);

    // Send any un-allocated tokens to the Safe Treasury
    if (azoriusGovernanceDaoData.tokenSupply > tokenAllocationSum) {
      // TODO -- verify this doesn't need to be the predicted safe address (that they are the same)
      tokenAllocationsOwners.push(this.safeContract.address);
      tokenAllocationsValues.push(azoriusGovernanceDaoData.tokenSupply - tokenAllocationSum);
    }

    return [tokenAllocationsOwners, tokenAllocationsValues];
  }

  private setEncodedSetupTokenData() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    const [tokenAllocationsOwners, tokenAllocationsValues] =
      this.calculateTokenAllocations(azoriusGovernanceDaoData);

    const encodedInitTokenData = encodeAbiParameters(
      parseAbiParameters('string, string, address[], uint256[]'),
      [
        azoriusGovernanceDaoData.tokenName,
        azoriusGovernanceDaoData.tokenSymbol,
        tokenAllocationsOwners,
        tokenAllocationsValues,
      ],
    );

    this.encodedSetupTokenData = encodeFunctionData({
      abi: this.azoriusContracts!.votesTokenMasterCopyContract.abi,
      functionName: 'setUp',
      args: [encodedInitTokenData],
    });
  }

  private setPredictedTokenAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.votesTokenMasterCopyContract.address.slice(2) as Address,
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenData!, this.tokenNonce);

    this.predictedTokenAddress = getCreate2Address({
      from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
      salt: tokenSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [tokenByteCodeLinear])),
    });
  }

  private setEncodedSetupTokenClaimData() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    const encodedInitTokenData = encodeAbiParameters(
      parseAbiParameters('address, address, address, uint256'),
      [
        this.safeContract.address,
        this.parentTokenAddress as Address,
        this.predictedTokenAddress as Address,
        azoriusGovernanceDaoData.parentAllocationAmount,
      ],
    );
    this.encodedSetupTokenClaimData = encodeFunctionData({
      abi: this.azoriusContracts!.claimingMasterCopyContract.abi,
      functionName: 'setUp',
      args: [encodedInitTokenData],
    });
  }

  private setPredictedTokenClaimAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.claimingMasterCopyContract.address.slice(2) as Address,
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenClaimData!, this.claimNonce);

    this.predictedTokenClaimAddress = getCreate2Address({
      from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
      salt: tokenSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [tokenByteCodeLinear])),
    });
  }

  private async setPredictedStrategyAddress() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    if (azoriusGovernanceDaoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      const quorumDenominator =
        (await this.azoriusContracts!.linearVotingMasterCopyContract.read.QUORUM_DENOMINATOR()) as bigint;
      const encodedStrategyInitParams = encodeAbiParameters(
        parseAbiParameters('address, address, address, uint32, uint256, uint256, uint256'),
        [
          this.safeContract.address, // owner
          this.predictedTokenAddress as Address, // governance token
          '0x0000000000000000000000000000000000000001', // Azorius module
          Number(azoriusGovernanceDaoData.votingPeriod),
          1n, // proposer weight, how much is needed to create a proposal.
          (azoriusGovernanceDaoData.quorumPercentage * quorumDenominator) / 100n, // quorom numerator, denominator is 1,000,000, so quorum percentage is quorumNumerator * 100 / quorumDenominator
          500000n, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ],
      );

      const encodedStrategySetupData = encodeFunctionData({
        abi: this.azoriusContracts!.linearVotingMasterCopyContract.abi,
        functionName: 'setUp',
        args: [encodedStrategyInitParams],
      });

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        this.azoriusContracts!.linearVotingMasterCopyContract.address.slice(2) as Address,
      );

      const strategySalt = keccak256(
        encodePacked(
          ['bytes32', 'uint256'],
          [keccak256(encodePacked(['bytes'], [encodedStrategySetupData])), this.strategyNonce],
        ),
      );

      this.encodedStrategySetupData = encodedStrategySetupData;

      this.predictedStrategyAddress = getCreate2Address({
        from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
        salt: strategySalt,
        bytecodeHash: keccak256(encodePacked(['bytes'], [strategyByteCodeLinear])),
      });
    } else if (azoriusGovernanceDaoData.votingStrategyType === VotingStrategyType.LINEAR_ERC721) {
      const daoData = azoriusGovernanceDaoData as AzoriusERC721DAO;

      const encodedStrategyInitParams = encodeAbiParameters(
        parseAbiParameters(
          'address, address[], uint256[], address, uint32, uint256, uint256, uint256',
        ),
        [
          this.safeContract.address, // owner
          daoData.nfts.map(nft => nft.tokenAddress), // governance tokens addresses
          daoData.nfts.map(nft => nft.tokenWeight), // governance tokens weights
          '0x0000000000000000000000000000000000000001', // Azorius module
          Number(azoriusGovernanceDaoData.votingPeriod),
          daoData.quorumThreshold, // quorom threshold. Since smart contract can't know total of NFTs minted - we need to provide it manually
          1n, // proposer weight, how much is needed to create a proposal.
          500000n, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ],
      );

      const encodedStrategySetupData = encodeFunctionData({
        abi: this.azoriusContracts!.linearVotingERC721MasterCopyContract.abi,
        functionName: 'setUp',
        args: [encodedStrategyInitParams],
      });

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        this.azoriusContracts!.linearVotingERC721MasterCopyContract.address.slice(2) as Address,
      );

      const strategySalt = keccak256(
        encodePacked(
          ['bytes32', 'uint256'],
          [keccak256(encodePacked(['bytes'], [encodedStrategySetupData])), this.strategyNonce],
        ),
      );

      this.encodedStrategySetupData = encodedStrategySetupData;

      this.predictedStrategyAddress = getCreate2Address({
        from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
        salt: strategySalt,
        bytecodeHash: keccak256(encodePacked(['bytes'], [strategyByteCodeLinear])),
      });
    }
  }

  // TODO - verify we can use safe contract address
  private setPredictedAzoriusAddress() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    const encodedInitAzoriusData = encodeAbiParameters(
      parseAbiParameters(['address, address, address, address[], uint32, uint32']),
      [
        this.safeContract.address,
        this.safeContract.address,
        this.safeContract.address,
        [this.predictedStrategyAddress as Address],
        Number(azoriusGovernanceDaoData.timelock), // timelock period in blocks
        Number(azoriusGovernanceDaoData.executionPeriod), // execution period in blocks
      ],
    );

    const encodedSetupAzoriusData = encodeFunctionData({
      abi: this.azoriusContracts!.fractalAzoriusMasterCopyContract.abi,
      functionName: 'setUp',
      args: [encodedInitAzoriusData],
    });

    const azoriusByteCodeLinear = generateContractByteCodeLinear(
      this.azoriusContracts!.fractalAzoriusMasterCopyContract.address.slice(2) as Address,
    );
    const azoriusSalt = generateSalt(encodedSetupAzoriusData, this.azoriusNonce);

    this.encodedSetupAzoriusData = encodedSetupAzoriusData;
    this.predictedAzoriusAddress = getCreate2Address({
      from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
      salt: azoriusSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [azoriusByteCodeLinear])),
    });
  }
}
