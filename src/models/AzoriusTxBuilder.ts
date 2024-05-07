import {
  Azorius,
  Azorius__factory,
  LinearERC20Voting,
  LinearERC20Voting__factory,
  LinearERC721Voting,
  LinearERC721Voting__factory,
  VotesERC20,
  VotesERC20__factory,
} from '@fractal-framework/fractal-contracts';
import {
  getCreate2Address,
  Address,
  Hex,
  encodePacked,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  getAddress,
  isAddress,
  isHex,
  encodeFunctionData,
} from 'viem';
import VotesERC20Abi from '../assets/abi/VotesERC20';
import VotesERC20WrapperAbi from '../assets/abi/VotesERC20Wrapper';
import { GnosisSafeL2 } from '../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { SENTINEL_ADDRESS } from '../constants/common';
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
  private readonly safeContract: GnosisSafeL2;

  private encodedSetupTokenData: Hex | undefined;
  private encodedSetupERC20WrapperData: Hex | undefined;
  private encodedStrategySetupData: Hex | undefined;
  private encodedSetupAzoriusData: Hex | undefined;
  private encodedSetupTokenClaimData: Hex | undefined;

  private predictedTokenAddress: Address | undefined;
  private predictedStrategyAddress: Address | undefined;
  private predictedAzoriusAddress: Address | undefined;
  private predictedTokenClaimAddress: Address | undefined;

  public azoriusContract: Azorius | undefined;
  public linearVotingContract: LinearERC20Voting | undefined;
  public linearERC721VotingContract: LinearERC721Voting | undefined;
  public votesTokenContract: VotesERC20 | undefined;

  private votesERC20WrapperMasterCopyAddress: string;
  private votesERC20MasterCopyAddress: string;

  private tokenNonce: bigint;
  private strategyNonce: bigint;
  private azoriusNonce: bigint;
  private claimNonce: bigint;

  constructor(
    signerOrProvider: any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts,
    daoData: AzoriusERC20DAO | AzoriusERC721DAO,
    safeContract: GnosisSafeL2,
    votesERC20WrapperMasterCopyAddress: string,
    votesERC20MasterCopyAddress: string,
    parentAddress?: Address,
    parentTokenAddress?: Address,
  ) {
    super(
      signerOrProvider,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress,
    );

    this.safeContract = safeContract;

    this.tokenNonce = getRandomBytes();
    this.claimNonce = getRandomBytes();
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();

    this.votesERC20WrapperMasterCopyAddress = votesERC20WrapperMasterCopyAddress;
    this.votesERC20MasterCopyAddress = votesERC20MasterCopyAddress;

    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      daoData = daoData as AzoriusERC20DAO;
      if (!daoData.isTokenImported) {
        this.setEncodedSetupTokenData();
        this.setPredictedTokenAddress();
      } else {
        if (daoData.isVotesToken) {
          this.predictedTokenAddress = daoData.tokenImportAddress as Address;
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
    this.setContracts();

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
      daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20
        ? this.linearVotingContract!
        : this.linearERC721VotingContract!,
      'setAzorius', // contract function name
      [this.azoriusContract!.address],
      0,
      false,
    );
  }

  public buildEnableAzoriusModuleTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'enableModule',
      [this.azoriusContract!.address],
      0,
      false,
    );
  }

  public buildAddAzoriusContractAsOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'addOwnerWithThreshold',
      [this.azoriusContract!.address, 1],
      0,
      false,
    );
  }

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'removeOwner',
      [this.azoriusContract!.address, this.baseContracts.multiSendContract.address, 1],
      0,
      false,
    );
  }

  public buildCreateTokenTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [this.votesERC20MasterCopyAddress, this.encodedSetupTokenData, this.tokenNonce],
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
      this.votesTokenContract!,
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
      [this.votesERC20WrapperMasterCopyAddress, this.encodedSetupERC20WrapperData, this.tokenNonce],
      0,
      false,
    );
  }

  public setEncodedSetupERC20WrapperData() {
    const { tokenImportAddress } = this.daoData as AzoriusERC20DAO;

    if (!tokenImportAddress || !isAddress(tokenImportAddress)) {
      throw new Error(
        'Error encoding setup ERC-20 Wrapper data - provided token import address is not an address',
      );
    }

    const encodedInitTokenData = encodeAbiParameters(parseAbiParameters('address'), [
      tokenImportAddress,
    ]);

    this.encodedSetupERC20WrapperData = encodeFunctionData({
      abi: VotesERC20WrapperAbi,
      functionName: 'setUp',
      args: [encodedInitTokenData],
    });
  }

  public setPredictedERC20WrapperAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      getAddress(this.votesERC20WrapperMasterCopyAddress),
    );

    const tokenSalt = generateSalt(this.encodedSetupERC20WrapperData!, this.tokenNonce);

    this.predictedTokenAddress = getCreate2Address({
      from: getAddress(this.baseContracts.zodiacModuleProxyFactoryContract.address),
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
    const tokenAllocationsOwners = azoriusGovernanceDaoData.tokenAllocations.map(tokenAllocation =>
      getAddress(tokenAllocation.address),
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
      tokenAllocationsOwners.push(getAddress(this.safeContract.address));
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
      abi: VotesERC20Abi,
      functionName: 'setUp',
      args: [encodedInitTokenData],
    });
  }

  private setPredictedTokenAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      getAddress(this.votesERC20MasterCopyAddress),
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenData!, this.tokenNonce);

    this.predictedTokenAddress = getCreate2Address({
      from: getAddress(this.baseContracts.zodiacModuleProxyFactoryContract.address),
      salt: tokenSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [tokenByteCodeLinear])),
    });
  }

  private setEncodedSetupTokenClaimData() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    if (!this.parentTokenAddress || !this.predictedTokenAddress) {
      throw new Error('Parent token address or predicted token address were not provided');
    }
    const encodedInitTokenData = encodeAbiParameters(
      parseAbiParameters('uint32, address, address, address, uint256'),
      [
        0, // `deadlineBlock`, 0 means never expires, currently no UI for setting this in the app.
        getAddress(this.safeContract.address),
        getAddress(this.parentTokenAddress),
        getAddress(this.predictedTokenAddress),
        azoriusGovernanceDaoData.parentAllocationAmount,
      ],
    );
    const encodedSetupTokenClaimData =
      this.azoriusContracts!.claimingMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitTokenData,
      ]);
    if (!isHex(encodedSetupTokenClaimData)) {
      throw new Error('Error ecnoding setup token claim data');
    }
    this.encodedSetupTokenClaimData = encodedSetupTokenClaimData;
  }

  private setPredictedTokenClaimAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(
      getAddress(this.azoriusContracts!.claimingMasterCopyContract.address),
    );

    const tokenSalt = generateSalt(this.encodedSetupTokenClaimData!, this.claimNonce);

    this.predictedTokenClaimAddress = getCreate2Address({
      from: getAddress(this.baseContracts.zodiacModuleProxyFactoryContract.address),
      salt: tokenSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [tokenByteCodeLinear])),
    });
  }

  private async setPredictedStrategyAddress() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    if (azoriusGovernanceDaoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      if (!this.predictedTokenAddress) {
        throw new Error(
          'Error predicting strategy address - predicted token address was not provided',
        );
      }
      const quorumDenominator = (
        await this.azoriusContracts!.linearVotingMasterCopyContract.QUORUM_DENOMINATOR()
      ).toBigInt();
      const encodedStrategyInitParams = encodeAbiParameters(
        parseAbiParameters('address, address, address, uint32, uint256, uint256, uint256'),
        [
          getAddress(this.safeContract.address), // owner
          getAddress(this.predictedTokenAddress), // governance token
          SENTINEL_ADDRESS, // Azorius module
          Number(azoriusGovernanceDaoData.votingPeriod),
          1n, // proposer weight, how much is needed to create a proposal.
          (azoriusGovernanceDaoData.quorumPercentage * quorumDenominator) / 100n, // quorom numerator, denominator is 1,000,000, so quorum percentage is quorumNumerator * 100 / quorumDenominator
          500000n, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ],
      );

      const encodedStrategySetupData =
        this.azoriusContracts!.linearVotingMasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedStrategyInitParams],
        );
      if (!isHex(encodedStrategySetupData)) {
        throw new Error('Error encoding strategy setup data');
      }

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        getAddress(this.azoriusContracts!.linearVotingMasterCopyContract.address),
      );

      const strategySalt = keccak256(
        encodePacked(
          ['bytes32', 'uint256'],
          [keccak256(encodePacked(['bytes'], [encodedStrategySetupData])), this.strategyNonce],
        ),
      );

      this.encodedStrategySetupData = encodedStrategySetupData;

      this.predictedStrategyAddress = getCreate2Address({
        from: getAddress(this.baseContracts.zodiacModuleProxyFactoryContract.address),
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
          getAddress(this.safeContract.address), // owner
          daoData.nfts.map(nft => nft.tokenAddress!), // governance tokens addresses
          daoData.nfts.map(nft => nft.tokenWeight), // governance tokens weights
          SENTINEL_ADDRESS, // Azorius module
          Number(azoriusGovernanceDaoData.votingPeriod),
          daoData.quorumThreshold, // quorom threshold. Since smart contract can't know total of NFTs minted - we need to provide it manually
          1n, // proposer weight, how much is needed to create a proposal.
          500000n, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ],
      );

      const encodedStrategySetupData =
        this.azoriusContracts!.linearVotingERC721MasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedStrategyInitParams],
        );

      if (!isHex(encodedStrategySetupData)) {
        throw new Error('Error encoding strategy setup data');
      }

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        getAddress(this.azoriusContracts!.linearVotingERC721MasterCopyContract.address),
      );

      const strategySalt = keccak256(
        encodePacked(
          ['bytes32', 'uint256'],
          [keccak256(encodePacked(['bytes'], [encodedStrategySetupData])), this.strategyNonce],
        ),
      );

      this.encodedStrategySetupData = encodedStrategySetupData;

      this.predictedStrategyAddress = getCreate2Address({
        from: getAddress(this.baseContracts.zodiacModuleProxyFactoryContract.address),
        salt: strategySalt,
        bytecodeHash: keccak256(encodePacked(['bytes'], [strategyByteCodeLinear])),
      });
    }
  }

  // TODO - verify we can use safe contract address
  private setPredictedAzoriusAddress() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    const safeContractAddress = getAddress(this.safeContract.address);
    const encodedInitAzoriusData = encodeAbiParameters(
      parseAbiParameters(['address, address, address, address[], uint32, uint32']),
      [
        safeContractAddress,
        safeContractAddress,
        safeContractAddress,
        [this.predictedStrategyAddress!],
        Number(azoriusGovernanceDaoData.timelock), // timelock period in blocks
        Number(azoriusGovernanceDaoData.executionPeriod), // execution period in blocks
      ],
    );

    const encodedSetupAzoriusData =
      this.azoriusContracts!.fractalAzoriusMasterCopyContract.interface.encodeFunctionData(
        'setUp',
        [encodedInitAzoriusData],
      );

    if (!isHex(encodedSetupAzoriusData)) {
      throw new Error('Error encoding setup azorius data');
    }

    const azoriusByteCodeLinear = generateContractByteCodeLinear(
      getAddress(this.azoriusContracts!.fractalAzoriusMasterCopyContract.address),
    );
    const azoriusSalt = generateSalt(encodedSetupAzoriusData, this.azoriusNonce);

    this.encodedSetupAzoriusData = encodedSetupAzoriusData;
    this.predictedAzoriusAddress = getCreate2Address({
      from: getAddress(this.baseContracts.zodiacModuleProxyFactoryContract.address),
      salt: azoriusSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [azoriusByteCodeLinear])),
    });
  }

  private setContracts() {
    const daoData = this.daoData as AzoriusGovernanceDAO;
    this.azoriusContract = Azorius__factory.connect(
      this.predictedAzoriusAddress!,
      this.signerOrProvider,
    );
    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      this.linearVotingContract = LinearERC20Voting__factory.connect(
        this.predictedStrategyAddress!,
        this.signerOrProvider,
      );
      this.votesTokenContract = VotesERC20__factory.connect(
        this.predictedTokenAddress!,
        this.signerOrProvider,
      );
    } else if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC721) {
      this.linearERC721VotingContract = LinearERC721Voting__factory.connect(
        this.predictedStrategyAddress!,
        this.signerOrProvider,
      );
    }
  }
}
