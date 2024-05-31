import {
  ERC20FreezeVoting__factory,
  MultisigFreezeGuard__factory,
  MultisigFreezeVoting__factory,
  ERC721FreezeVoting__factory,
  MultisigFreezeVoting,
  ERC20FreezeVoting,
  ERC721FreezeVoting,
} from '@fractal-framework/fractal-contracts';
import {
  getAddress,
  getCreate2Address,
  keccak256,
  encodePacked,
  Address,
  Hex,
  encodeAbiParameters,
  parseAbiParameters,
  isHex,
  PublicClient,
  Abi,
  encodeFunctionData,
} from 'viem';
import AzoriusFreezeGuardAbi from '../assets/abi/AzoriusFreezeGuard';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import ModuleProxyFactoryAbi from '../assets/abi/ModuleProxyFactory';
import { buildContractCall, buildContractCallViem } from '../helpers';
import { BaseContracts, SafeTransaction, SubDAO, VotingStrategyType } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { generateContractByteCodeLinear, generateSalt } from './helpers/utils';

export class FreezeGuardTxBuilder extends BaseTxBuilder {
  // Salt used to generate transactions
  private readonly saltNum;

  // Safe Data
  private readonly safeContractAddress: Address;

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
  private moduleProxyFactoryAddress: Address;
  private azoriusFreezeGuardMasterCopyAddress: Address;

  constructor(
    signerOrProvider: any,
    publicClient: PublicClient,
    baseContracts: BaseContracts,
    daoData: SubDAO,
    safeContractAddress: Address,
    saltNum: bigint,
    parentAddress: Address,
    moduleProxyFactoryAddress: Address,
    azoriusFreezeGuardMasterCopyAddress: Address,
    isAzorius: boolean,
    parentTokenAddress?: Address,
    azoriusAddress?: Address,
    strategyAddress?: Address,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: Address,
  ) {
    super(
      signerOrProvider,
      publicClient,
      baseContracts,
      isAzorius,
      daoData,
      parentAddress,
      parentTokenAddress,
    );

    this.safeContractAddress = safeContractAddress;
    this.saltNum = saltNum;
    this.azoriusAddress = azoriusAddress;
    this.strategyAddress = strategyAddress;
    this.parentStrategyType = parentStrategyType;
    this.parentStrategyAddress = parentStrategyAddress;
    this.moduleProxyFactoryAddress = moduleProxyFactoryAddress;
    this.azoriusFreezeGuardMasterCopyAddress = azoriusFreezeGuardMasterCopyAddress;

    this.initFreezeVotesData();
  }

  initFreezeVotesData() {
    this.setFreezeVotingTypeAndCallData();
    this.setFreezeVotingAddress();
    this.setFreezeGuardData();
    this.setFreezeGuardAddress();
  }

  public buildDeployZodiacModuleTx(): SafeTransaction {
    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
      'deployModule',
      [
        this.freezeVotingType === ERC20FreezeVoting__factory
          ? this.baseContracts.freezeERC20VotingMasterCopyContract.address
          : this.freezeVotingType === ERC721FreezeVoting__factory
            ? this.baseContracts.freezeERC721VotingMasterCopyContract.address
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

    const parentStrategyAddress =
      this.parentStrategyType === VotingStrategyType.LINEAR_ERC721
        ? this.parentStrategyAddress
        : this.parentTokenAddress ?? this.parentAddress;
    if (!this.parentAddress || !parentStrategyAddress) {
      throw new Error(
        'Error building contract call for setting up freeze voting - required addresses were not provided.',
      );
    }

    return buildContractCall(
      this.freezeVotingType.connect(this.freezeVotingAddress, this.signerOrProvider),
      'setUp',
      [
        encodeAbiParameters(parseAbiParameters('address, uint256, uint32, uint32, address'), [
          getAddress(this.parentAddress), // Owner -- Parent DAO
          subDaoData.freezeVotesThreshold, // FreezeVotesThreshold
          Number(subDaoData.freezeProposalPeriod), // FreezeProposalPeriod
          Number(subDaoData.freezePeriod), // FreezePeriod
          getAddress(parentStrategyAddress), // Parent Votes Token or Parent Safe Address
        ]),
      ],
      0,
      false,
    );
  }

  public buildSetGuardTx(abi: Abi, address: Address): SafeTransaction {
    return buildContractCallViem(abi, address, 'setGuard', [this.freezeGuardAddress], 0, false);
  }

  public buildSetGuardTxSafe(safeAddress: Address): SafeTransaction {
    return buildContractCallViem(
      GnosisSafeL2Abi,
      safeAddress,
      'setGuard',
      [this.freezeGuardAddress],
      0,
      false,
    );
  }

  public buildDeployFreezeGuardTx() {
    return buildContractCallViem(
      ModuleProxyFactoryAbi,
      this.moduleProxyFactoryAddress,
      'deployModule',
      [this.getGuardMasterCopyAddress(), this.freezeGuardCallData!, this.saltNum],
      0,
      false,
    );
  }

  /**
   * Methods to generate freeze voting and guard addresses
   * As well as calldata needed to create deploy Txs
   */

  private setFreezeVotingTypeAndCallData() {
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        this.freezeVotingType = ERC20FreezeVoting__factory;
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        this.freezeVotingType = ERC721FreezeVoting__factory;
      }
    } else {
      this.freezeVotingType = MultisigFreezeVoting__factory;
    }

    this.freezeVotingCallData = this.freezeVotingType.createInterface().encodeFunctionData('owner');
  }

  private setFreezeVotingAddress() {
    let freezeVotesMasterCopyContract:
      | MultisigFreezeVoting
      | ERC20FreezeVoting
      | ERC721FreezeVoting = this.baseContracts.freezeMultisigVotingMasterCopyContract;
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        freezeVotesMasterCopyContract = this.baseContracts.freezeERC20VotingMasterCopyContract;
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        freezeVotesMasterCopyContract = this.baseContracts.freezeERC721VotingMasterCopyContract;
      }
    }

    const freezeVotingByteCodeLinear = generateContractByteCodeLinear(
      getAddress(freezeVotesMasterCopyContract.address),
    );

    this.freezeVotingAddress = getCreate2Address({
      from: this.moduleProxyFactoryAddress,
      salt: generateSalt(this.freezeVotingCallData!, this.saltNum),
      bytecodeHash: keccak256(encodePacked(['bytes'], [freezeVotingByteCodeLinear])),
    });
  }

  private setFreezeGuardAddress() {
    const freezeGuardByteCodeLinear = generateContractByteCodeLinear(
      getAddress(this.getGuardMasterCopyAddress()),
    );
    const freezeGuardSalt = generateSalt(this.freezeGuardCallData!, this.saltNum);

    this.freezeGuardAddress = getCreate2Address({
      from: this.moduleProxyFactoryAddress,
      salt: freezeGuardSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [freezeGuardByteCodeLinear])),
    });
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

    if (!this.parentAddress || !this.freezeVotingAddress) {
      throw new Error(
        'Error encoding freeze guard call data - parent address or freeze voting address not provided',
      );
    }
    const freezeGuardCallData = MultisigFreezeGuard__factory.createInterface().encodeFunctionData(
      'setUp',
      [
        encodeAbiParameters(parseAbiParameters('uint32, uint32, address, address, address'), [
          Number(subDaoData.timelockPeriod), // Timelock Period
          Number(subDaoData.executionPeriod), // Execution Period
          getAddress(this.parentAddress), // Owner -- Parent DAO
          getAddress(this.freezeVotingAddress), // Freeze Voting
          this.safeContractAddress, // Safe
        ]),
      ],
    );
    if (!isHex(freezeGuardCallData)) {
      throw new Error('Error encoding freeze guard call data');
    }
    this.freezeGuardCallData = freezeGuardCallData;
  }

  private setFreezeGuardCallDataAzorius() {
    if (
      !this.parentAddress ||
      !this.freezeVotingAddress ||
      !this.strategyAddress ||
      !this.azoriusAddress
    ) {
      throw new Error(
        'Error encoding freeze guard call data - required addresses were not provided',
      );
    }

    const freezeGuardCallData = encodeFunctionData({
      abi: AzoriusFreezeGuardAbi,
      functionName: 'setUp',
      args: [
        encodeAbiParameters(parseAbiParameters('address, address'), [
          getAddress(this.parentAddress), // Owner -- Parent DAO
          getAddress(this.freezeVotingAddress), // Freeze Voting
        ]),
      ],
    });

    this.freezeGuardCallData = freezeGuardCallData;
  }

  private getGuardMasterCopyAddress(): string {
    return this.isAzorius
      ? this.azoriusFreezeGuardMasterCopyAddress
      : this.baseContracts.multisigFreezeGuardMasterCopyContract.address;
  }
}
