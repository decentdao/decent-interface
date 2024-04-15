import {
  Address,
  Hex,
  PublicClient,
  WalletClient,
  getCreate2Address,
  keccak256,
  encodePacked,
  encodeFunctionData,
  parseAbiParameters,
  encodeAbiParameters,
} from 'viem';
import { buildContractCall } from '../helpers';
import {
  BaseContracts,
  SafeTransaction,
  SubDAO,
  AzoriusContracts,
  VotingStrategyType,
  SafeL2,
  Azorius,
} from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import {
  buildDeployZodiacModuleTx,
  generateContractByteCodeLinear,
  generatePredictedModuleAddress,
  generateSalt,
} from './helpers/utils';

export class FreezeGuardTxBuilder extends BaseTxBuilder {
  // Salt used to generate transactions
  private readonly saltNum;

  // Safe Data
  private readonly safeContract: SafeL2;

  // Freeze Voting Data
  private freezeVotingType: any;
  private freezeVotingCallData: Hex | undefined;
  private freezeVotingAddress: Address | undefined;

  // Freeze Guard Data
  private freezeGuardCallData: Hex | undefined;
  private freezeGuardAddress: Address | undefined;

  // Azorius Data
  private azoriusAddress: Address | undefined;
  private strategyAddress: Address | undefined;

  private parentStrategyType: VotingStrategyType | undefined;
  private parentStrategyAddress: Address | undefined;

  constructor(
    walletOrPublicClient: WalletClient | PublicClient,
    baseContracts: BaseContracts,
    daoData: SubDAO,
    safeContract: SafeL2,
    saltNum: bigint,
    parentAddress: Address,
    parentTokenAddress?: Address,
    azoriusContracts?: AzoriusContracts,
    azoriusAddress?: Address,
    strategyAddress?: Address,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: Address,
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
    this.saltNum = saltNum;
    this.azoriusAddress = azoriusAddress;
    this.strategyAddress = strategyAddress;
    this.parentStrategyType = parentStrategyType;
    this.parentStrategyAddress = parentStrategyAddress;

    this.initFreezeVotesData();
  }

  initFreezeVotesData() {
    this.setFreezeVotingTypeAndCallData();
    this.setFreezeVotingAddress();
    this.setFreezeGuardData();
    this.setFreezeGuardAddress();
  }

  public buildDeployZodiacModuleTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.freezeVotingType === this.baseContracts.freezeERC20VotingMasterCopyContract
          ? this.baseContracts.freezeERC20VotingMasterCopyContract.address
          : this.freezeVotingType === this.baseContracts.freezeERC721VotingMasterCopyContract
            ? this.baseContracts.freezeERC721VotingMasterCopyContract!.address
            : this.baseContracts.freezeMultisigVotingMasterCopyContract.address,
        this.freezeVotingCallData,
        this.saltNum,
      ],
      0,
      false,
    );
  }

  public buildFreezeVotingSetupTx(): SafeTransaction {
    const subDaoData = this.daoData as SubDAO;

    return buildContractCall(
      { address: this.freezeVotingAddress!, abi: this.freezeVotingType.abi },
      'setUp',
      [
        encodeAbiParameters(parseAbiParameters('address, uint256, uint32, uint32, address'), [
          this.parentAddress!, // Owner -- Parent DAO
          subDaoData.freezeVotesThreshold, // FreezeVotesThreshold
          Number(subDaoData.freezeProposalPeriod), // FreezeProposalPeriod
          Number(subDaoData.freezePeriod), // FreezePeriod
          this.parentStrategyType === VotingStrategyType.LINEAR_ERC721
            ? this.parentStrategyAddress!
            : this.parentTokenAddress! ?? this.parentAddress!, // Parent Votes Token or Parent Safe Address
        ]),
      ],
      0,
      false,
    );
  }

  public buildSetGuardTx(contract: SafeL2 | Azorius): SafeTransaction {
    return buildContractCall(contract, 'setGuard', [this.freezeGuardAddress], 0, false);
  }

  public buildDeployFreezeGuardTx() {
    return buildDeployZodiacModuleTx(this.baseContracts.zodiacModuleProxyFactoryContract, [
      this.getGuardMasterCopyAddress(),
      this.freezeGuardCallData!,
      this.saltNum.toString(),
    ]);
  }

  /**
   * Methods to generate freeze voting and guard addresses
   * As well as calldata needed to create deploy Txs
   */

  private setFreezeVotingTypeAndCallData() {
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        this.freezeVotingType = this.baseContracts.freezeERC20VotingMasterCopyContract;
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        this.freezeVotingType = this.baseContracts.freezeERC721VotingMasterCopyContract!;
      }
    } else {
      this.freezeVotingType = this.baseContracts.freezeMultisigVotingMasterCopyContract;
    }

    this.freezeVotingCallData = encodeFunctionData({
      functionName: 'owner',
      abi: this.freezeVotingType.abi,
      args: [],
    });
  }

  private setFreezeVotingAddress() {
    let freezeVotesMasterCopyContract = this.baseContracts.freezeMultisigVotingMasterCopyContract;
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        freezeVotesMasterCopyContract = this.baseContracts.freezeERC20VotingMasterCopyContract;
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        freezeVotesMasterCopyContract = this.baseContracts.freezeERC721VotingMasterCopyContract!;
      }
    }

    const freezeVotingByteCodeLinear = generateContractByteCodeLinear(
      freezeVotesMasterCopyContract.address.slice(2) as Address,
    );

    this.freezeVotingAddress = getCreate2Address({
      from: this.baseContracts.zodiacModuleProxyFactoryContract.address,
      salt: generateSalt(this.freezeVotingCallData!, this.saltNum),
      bytecodeHash: keccak256(encodePacked(['bytes'], [freezeVotingByteCodeLinear])),
    });
  }

  private setFreezeGuardAddress() {
    const freezeGuardByteCodeLinear = generateContractByteCodeLinear(
      this.getGuardMasterCopyAddress().slice(2) as Address,
    );
    const freezeGuardSalt = generateSalt(this.freezeGuardCallData!, this.saltNum);

    this.freezeGuardAddress = generatePredictedModuleAddress(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      freezeGuardSalt,
      freezeGuardByteCodeLinear,
    );
  }

  private setFreezeGuardData() {
    if (this.azoriusAddress) {
      this.setFreezeGuardCallDataAzorius();
    } else {
      this.setFreezeGuardCallDataMultisig();
    }
  }

  private setFreezeGuardCallDataMultisig() {
    const subDaoData = this.daoData as SubDAO;

    this.freezeGuardCallData = encodeFunctionData({
      functionName: 'setUp',
      abi: this.baseContracts.multisigFreezeGuardMasterCopyContract.abi,
      args: [
        encodeAbiParameters(parseAbiParameters('uint256, uint256, address, address, address'), [
          subDaoData.timelockPeriod, // Timelock Period
          subDaoData.executionPeriod, // Execution Period
          this.parentAddress!, // Owner -- Parent DAO
          this.freezeVotingAddress!, // Freeze Voting
          this.safeContract.address, // Safe
        ]),
      ],
    });
  }

  private setFreezeGuardCallDataAzorius() {
    const subDaoData = this.daoData as SubDAO;
    this.freezeGuardCallData = encodeFunctionData({
      abi: this.azoriusContracts?.azoriusFreezeGuardMasterCopyContract.abi!,
      functionName: 'setUp',
      args: [
        encodeAbiParameters(parseAbiParameters('address, address, address, address, uint256'), [
          this.parentAddress!, // Owner -- Parent DAO
          this.freezeVotingAddress!, // Freeze Voting
          this.strategyAddress!, // Base Strategy
          this.azoriusAddress!, // Azorius
          subDaoData.executionPeriod, // Execution Period
        ]),
      ],
    });
  }

  private getGuardMasterCopyAddress(): string {
    return this.azoriusContracts
      ? this.azoriusContracts.azoriusFreezeGuardMasterCopyContract.address
      : this.baseContracts.multisigFreezeGuardMasterCopyContract.address;
  }
}
