import {
  MultisigFreezeVoting__factory,
  ERC721FreezeVoting__factory,
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
  PublicClient,
  Abi,
  encodeFunctionData,
  isHex,
} from 'viem';
import AzoriusFreezeGuardAbi from '../assets/abi/AzoriusFreezeGuard';
import ERC20FreezeVotingAbi from '../assets/abi/ERC20FreezeVoting';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import ModuleProxyFactoryAbi from '../assets/abi/ModuleProxyFactory';
import MultisigFreezeGuardAbi from '../assets/abi/MultisigFreezeGuard';
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
  private freezeVotingType:
    | typeof MultisigFreezeVoting__factory
    | typeof ERC721FreezeVoting__factory
    | 'erc20'
    | undefined;
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
  private multisigFreezeGuardMasterCopyAddress: Address;
  private erc20FreezeVotingMasterCopyAddress: Address;

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
    multisigFreezeGuardMasterCopyAddress: Address,
    erc20FreezeVotingMasterCopyAddress: Address,
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
    this.multisigFreezeGuardMasterCopyAddress = multisigFreezeGuardMasterCopyAddress;
    this.erc20FreezeVotingMasterCopyAddress = erc20FreezeVotingMasterCopyAddress;

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
        this.freezeVotingType === 'erc20'
          ? this.erc20FreezeVotingMasterCopyAddress
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
    if (!this.parentAddress || !parentStrategyAddress || !this.freezeVotingAddress) {
      throw new Error(
        'Error building contract call for setting up freeze voting - required addresses were not provided.',
      );
    }

    const functionArgs: [string, [string], number, boolean] = [
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
    ];

    if (this.freezeVotingType === 'erc20') {
      return buildContractCallViem(ERC20FreezeVotingAbi, this.freezeVotingAddress, ...functionArgs);
    } else if (this.freezeVotingType === ERC721FreezeVoting__factory) {
      return buildContractCall(
        ERC721FreezeVoting__factory.connect(this.freezeVotingAddress, this.signerOrProvider),
        ...functionArgs,
      );
    } else if (this.freezeVotingType === MultisigFreezeVoting__factory) {
      return buildContractCall(
        MultisigFreezeVoting__factory.connect(this.freezeVotingAddress, this.signerOrProvider),
        ...functionArgs,
      );
    } else {
      throw new Error('unsupported freeze voting type');
    }
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
        this.freezeVotingType = 'erc20';
        this.freezeVotingCallData = encodeFunctionData({
          abi: ERC20FreezeVotingAbi,
          functionName: 'owner',
        });
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        this.freezeVotingType = ERC721FreezeVoting__factory;
        const encodedFunctionData =
          ERC721FreezeVoting__factory.createInterface().encodeFunctionData('owner');
        if (!isHex(encodedFunctionData)) {
          throw new Error("encoded function data isn't a hex string");
        }
        this.freezeVotingCallData = encodedFunctionData;
      }
    } else {
      this.freezeVotingType = MultisigFreezeVoting__factory;
      const encodedFunctionData =
        MultisigFreezeVoting__factory.createInterface().encodeFunctionData('owner');
      if (!isHex(encodedFunctionData)) {
        throw new Error("encoded function data isn't a hex string");
      }
      this.freezeVotingCallData = encodedFunctionData;
    }
  }

  private setFreezeVotingAddress() {
    let freezeVotingByteCodeLinear: Hex;
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        freezeVotingByteCodeLinear = generateContractByteCodeLinear(
          this.erc20FreezeVotingMasterCopyAddress,
        );
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        freezeVotingByteCodeLinear = generateContractByteCodeLinear(
          getAddress(this.baseContracts.freezeERC721VotingMasterCopyContract.address),
        );
      } else {
        throw new Error('unknown voting parentStrategyType');
      }
    } else {
      freezeVotingByteCodeLinear = generateContractByteCodeLinear(
        getAddress(this.baseContracts.freezeMultisigVotingMasterCopyContract.address),
      );
    }

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

    const freezeGuardCallData = encodeFunctionData({
      abi: MultisigFreezeGuardAbi,
      functionName: 'setUp',
      args: [
        encodeAbiParameters(parseAbiParameters('uint32, uint32, address, address, address'), [
          Number(subDaoData.timelockPeriod), // Timelock Period
          Number(subDaoData.executionPeriod), // Execution Period
          getAddress(this.parentAddress), // Owner -- Parent DAO
          this.freezeVotingAddress, // Freeze Voting
          this.safeContractAddress, // Safe
        ]),
      ],
    });

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
      : this.multisigFreezeGuardMasterCopyAddress;
  }
}
