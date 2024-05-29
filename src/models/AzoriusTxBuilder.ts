import { Azorius, Azorius__factory } from '@fractal-framework/fractal-contracts';
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
  encodeFunctionData,
  PublicClient,
  getContract,
} from 'viem';
import AzoriusAbi from '../assets/abi/Azorius';
import ERC20ClaimAbi from '../assets/abi/ERC20Claim';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import LinearERC20VotingAbi from '../assets/abi/LinearERC20Voting';
import LinearERC721VotingAbi from '../assets/abi/LinearERC721Voting';
import ModuleProxyFactoryAbi from '../assets/abi/ModuleProxyFactory';
import VotesERC20Abi from '../assets/abi/VotesERC20';
import VotesERC20WrapperAbi from '../assets/abi/VotesERC20Wrapper';
import { SENTINEL_ADDRESS } from '../constants/common';
import { buildContractCallViem, getRandomBytes } from '../helpers';
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
  private readonly safeContractAddress: Address;

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
  public linearERC20VotingAddress: Address | undefined;
  public linearERC721VotingAddress: Address | undefined;
  public votesTokenAddress: Address | undefined;

  private votesERC20WrapperMasterCopyAddress: string;
  private votesERC20MasterCopyAddress: string;
  private moduleProxyFactoryAddress: Address;
  private multiSendCallOnlyAddress: Address;
  private erc20ClaimMasterCopyAddress: Address;
  private linearERC20VotingMasterCopyAddress: Address;
  private linearERC721VotingMasterCopyAddress: Address;
  private azoriusMasterCopyAddress: Address;

  private tokenNonce: bigint;
  private strategyNonce: bigint;
  private azoriusNonce: bigint;
  private claimNonce: bigint;

  constructor(
    signerOrProvider: any,
    publicClient: PublicClient,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts,
    daoData: AzoriusERC20DAO | AzoriusERC721DAO,
    safeContractAddress: Address,
    votesERC20WrapperMasterCopyAddress: string,
    votesERC20MasterCopyAddress: string,
    moduleProxyFactoryAddress: Address,
    multiSendCallOnlyAddress: Address,
    erc20ClaimMasterCopyAddress: Address,
    linearERC20VotingMasterCopyAddress: Address,
    linearERC721VotingMasterCopyAddress: Address,
    azoriusMasterCopyAddress: Address,
    parentAddress?: Address,
    parentTokenAddress?: Address,
  ) {
    super(
      signerOrProvider,
      publicClient,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress,
    );

    this.safeContractAddress = safeContractAddress;

    this.tokenNonce = getRandomBytes();
    this.claimNonce = getRandomBytes();
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();

    this.votesERC20WrapperMasterCopyAddress = votesERC20WrapperMasterCopyAddress;
    this.votesERC20MasterCopyAddress = votesERC20MasterCopyAddress;
    this.moduleProxyFactoryAddress = moduleProxyFactoryAddress;
    this.multiSendCallOnlyAddress = multiSendCallOnlyAddress;
    this.erc20ClaimMasterCopyAddress = erc20ClaimMasterCopyAddress;
    this.linearERC20VotingMasterCopyAddress = linearERC20VotingMasterCopyAddress;
    this.linearERC721VotingMasterCopyAddress = linearERC721VotingMasterCopyAddress;
    this.azoriusMasterCopyAddress = azoriusMasterCopyAddress;

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
      buildContractCallViem(
        GnosisSafeL2Abi,
        this.safeContractAddress,
        'removeOwner',
        [this.multiSendCallOnlyAddress, owner, 1],
        0,
        false,
      ),
    );
    return removeOwnerTxs;
  }

  public buildVotingContractSetupTx(): SafeTransaction {
    const daoData = this.daoData as AzoriusGovernanceDAO;

    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      return buildContractCallViem(
        LinearERC20VotingAbi,
        this.linearERC20VotingAddress!,
        'setAzorius', // contract function name
        [this.azoriusContract!.address],
        0,
        false,
      );
    } else if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC721) {
      return buildContractCallViem(
        LinearERC721VotingAbi,
        this.linearERC721VotingAddress!,
        'setAzorius', // contract function name
        [this.azoriusContract!.address],
        0,
        false,
      );
    } else {
      throw new Error('voting strategy type unknown');
    }
  }

  public buildEnableAzoriusModuleTx(): SafeTransaction {
    return buildContractCallViem(
      GnosisSafeL2Abi,
      this.safeContractAddress,
      'enableModule',
      [this.azoriusContract!.address],
      0,
      false,
    );
  }

  public buildAddAzoriusContractAsOwnerTx(): SafeTransaction {
    return buildContractCallViem(
      GnosisSafeL2Abi,
      this.safeContractAddress,
      'addOwnerWithThreshold',
      [this.azoriusContract!.address, 1],
      0,
      false,
    );
  }

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCallViem(
      GnosisSafeL2Abi,
      this.safeContractAddress,
      'removeOwner',
      [this.azoriusContract!.address, this.multiSendCallOnlyAddress, 1],
      0,
      false,
    );
  }

  public buildCreateTokenTx(): SafeTransaction {
    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
      'deployModule',
      [this.votesERC20MasterCopyAddress, this.encodedSetupTokenData, this.tokenNonce],
      0,
      false,
    );
  }

  public buildDeployStrategyTx(): SafeTransaction {
    const daoData = this.daoData as AzoriusGovernanceDAO;

    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
      'deployModule',
      [
        daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20
          ? this.linearERC20VotingMasterCopyAddress
          : this.linearERC721VotingMasterCopyAddress,
        this.encodedStrategySetupData,
        this.strategyNonce,
      ],
      0,
      false,
    );
  }

  public buildDeployAzoriusTx(): SafeTransaction {
    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
      'deployModule',
      [this.azoriusMasterCopyAddress, this.encodedSetupAzoriusData, this.azoriusNonce],
      0,
      false,
    );
  }

  public buildDeployTokenClaim() {
    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
      'deployModule',
      [this.erc20ClaimMasterCopyAddress, this.encodedSetupTokenClaimData, this.claimNonce],
      0,
      false,
    );
  }

  public buildApproveClaimAllocation() {
    if (!this.votesTokenAddress) {
      return;
    }

    const azoriusGovernanceDaoData = this.daoData as AzoriusERC20DAO;
    return buildContractCallViem(
      VotesERC20Abi,
      this.votesTokenAddress,
      'approve',
      [this.predictedTokenClaimAddress, azoriusGovernanceDaoData.parentAllocationAmount],
      0,
      false,
    );
  }

  public buildCreateTokenWrapperTx(): SafeTransaction {
    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
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
      from: this.moduleProxyFactoryAddress,
      salt: tokenSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [tokenByteCodeLinear])),
    });
  }

  public signatures = (): string => {
    return (
      '0x000000000000000000000000' +
      this.multiSendCallOnlyAddress.slice(2) +
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
      tokenAllocationsOwners.push(this.safeContractAddress);
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
      from: this.moduleProxyFactoryAddress,
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
        this.safeContractAddress,
        getAddress(this.parentTokenAddress),
        getAddress(this.predictedTokenAddress),
        azoriusGovernanceDaoData.parentAllocationAmount,
      ],
    );
    const encodedSetupTokenClaimData = encodeFunctionData({
      abi: ERC20ClaimAbi,
      functionName: 'setUp',
      args: [encodedInitTokenData],
    });

    this.encodedSetupTokenClaimData = encodedSetupTokenClaimData;
  }

  private setPredictedTokenClaimAddress() {
    const tokenByteCodeLinear = generateContractByteCodeLinear(this.erc20ClaimMasterCopyAddress);

    const tokenSalt = generateSalt(this.encodedSetupTokenClaimData!, this.claimNonce);

    this.predictedTokenClaimAddress = getCreate2Address({
      from: this.moduleProxyFactoryAddress,
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

      const linearERC20VotingMasterCopyContract = getContract({
        abi: LinearERC20VotingAbi,
        address: this.linearERC20VotingMasterCopyAddress,
        client: this.publicClient,
      });

      const quorumDenominator = await linearERC20VotingMasterCopyContract.read.QUORUM_DENOMINATOR();
      const encodedStrategyInitParams = encodeAbiParameters(
        parseAbiParameters('address, address, address, uint32, uint256, uint256, uint256'),
        [
          this.safeContractAddress, // owner
          getAddress(this.predictedTokenAddress), // governance token
          SENTINEL_ADDRESS, // Azorius module
          Number(azoriusGovernanceDaoData.votingPeriod),
          1n, // proposer weight, how much is needed to create a proposal.
          (azoriusGovernanceDaoData.quorumPercentage * quorumDenominator) / 100n, // quorom numerator, denominator is 1,000,000, so quorum percentage is quorumNumerator * 100 / quorumDenominator
          500000n, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ],
      );

      const encodedStrategySetupData = encodeFunctionData({
        abi: LinearERC20VotingAbi,
        functionName: 'setUp',
        args: [encodedStrategyInitParams],
      });

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        this.linearERC20VotingMasterCopyAddress,
      );

      const strategySalt = keccak256(
        encodePacked(
          ['bytes32', 'uint256'],
          [keccak256(encodePacked(['bytes'], [encodedStrategySetupData])), this.strategyNonce],
        ),
      );

      this.encodedStrategySetupData = encodedStrategySetupData;

      this.predictedStrategyAddress = getCreate2Address({
        from: this.moduleProxyFactoryAddress,
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
          this.safeContractAddress, // owner
          daoData.nfts.map(nft => nft.tokenAddress!), // governance tokens addresses
          daoData.nfts.map(nft => nft.tokenWeight), // governance tokens weights
          SENTINEL_ADDRESS, // Azorius module
          Number(azoriusGovernanceDaoData.votingPeriod),
          daoData.quorumThreshold, // quorom threshold. Since smart contract can't know total of NFTs minted - we need to provide it manually
          1n, // proposer weight, how much is needed to create a proposal.
          500000n, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ],
      );

      const encodedStrategySetupData = encodeFunctionData({
        abi: LinearERC721VotingAbi,
        functionName: 'setUp',
        args: [encodedStrategyInitParams],
      });

      const strategyByteCodeLinear = generateContractByteCodeLinear(
        this.linearERC721VotingMasterCopyAddress,
      );

      const strategySalt = keccak256(
        encodePacked(
          ['bytes32', 'uint256'],
          [keccak256(encodePacked(['bytes'], [encodedStrategySetupData])), this.strategyNonce],
        ),
      );

      this.encodedStrategySetupData = encodedStrategySetupData;

      this.predictedStrategyAddress = getCreate2Address({
        from: this.moduleProxyFactoryAddress,
        salt: strategySalt,
        bytecodeHash: keccak256(encodePacked(['bytes'], [strategyByteCodeLinear])),
      });
    }
  }

  // TODO - verify we can use safe contract address
  private setPredictedAzoriusAddress() {
    const azoriusGovernanceDaoData = this.daoData as AzoriusGovernanceDAO;
    const safeContractAddress = this.safeContractAddress;
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

    const encodedSetupAzoriusData = encodeFunctionData({
      abi: AzoriusAbi,
      functionName: 'setUp',
      args: [encodedInitAzoriusData],
    });

    const azoriusByteCodeLinear = generateContractByteCodeLinear(this.azoriusMasterCopyAddress);
    const azoriusSalt = generateSalt(encodedSetupAzoriusData, this.azoriusNonce);

    this.encodedSetupAzoriusData = encodedSetupAzoriusData;
    this.predictedAzoriusAddress = getCreate2Address({
      from: this.moduleProxyFactoryAddress,
      salt: azoriusSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [azoriusByteCodeLinear])),
    });
  }

  private setContracts() {
    if (!this.predictedTokenAddress || !this.predictedStrategyAddress) {
      return;
    }

    const daoData = this.daoData as AzoriusGovernanceDAO;
    this.azoriusContract = Azorius__factory.connect(
      this.predictedAzoriusAddress!,
      this.signerOrProvider,
    );
    if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      this.votesTokenAddress = this.predictedTokenAddress;
      this.linearERC20VotingAddress = this.predictedStrategyAddress;
    } else if (daoData.votingStrategyType === VotingStrategyType.LINEAR_ERC721) {
      this.linearERC721VotingAddress = this.predictedStrategyAddress;
    }
  }
}
