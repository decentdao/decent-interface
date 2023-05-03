import {
  Azorius,
  GnosisSafe,
  AzoriusFreezeGuard__factory,
  ERC20FreezeVoting__factory,
  MultisigFreezeGuard__factory,
  MultisigFreezeVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { buildContractCall } from '../helpers';
import { BaseContracts, SafeTransaction, SubDAO, AzoriusContracts } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import {
  buildDeployZodiacModuleTx,
  generateContractByteCodeLinear,
  generatePredictedModuleAddress,
  generateSalt,
} from './helpers/utils';

export class VetoGuardTxBuilder extends BaseTxBuilder {
  // Salt used to generate transactions
  private readonly saltNum;

  // Gnosis Safe Data
  private readonly safeContract: GnosisSafe;

  // Veto Voting Data
  private vetoVotingType: any;
  private vetoVotingCallData: string | undefined;
  private vetoVotingAddress: string | undefined;

  // Veto Guard Data
  private vetoGuardCallData: string | undefined;
  private vetoGuardAddress: string | undefined;

  // Azorius Data
  private azoriusAddress: string | undefined;
  private strategyAddress: string | undefined;

  constructor(
    signerOrProvider: any,
    baseContracts: BaseContracts,
    daoData: SubDAO,
    safeContract: GnosisSafe,
    saltNum: string,
    parentAddress: string,
    parentTokenAddress?: string,
    azoriusContracts?: AzoriusContracts,
    azoriusAddress?: string,
    strategyAddress?: string
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
    this.saltNum = saltNum;
    this.azoriusAddress = azoriusAddress;
    this.strategyAddress = strategyAddress;

    this.initVetoVotesData();
  }

  initVetoVotesData() {
    this.setVetoVotingTypeAndCallData();
    this.setVetoVotingAddress();
    this.setVetoGuardData();
    this.setVetoGuardAddress();
  }

  public buildDeployZodiacModuleTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.vetoVotingType === ERC20FreezeVoting__factory
          ? this.baseContracts.vetoERC20VotingMasterCopyContract.address
          : this.baseContracts.vetoMultisigVotingMasterCopyContract.address,
        this.vetoVotingCallData,
        this.saltNum,
      ],
      0,
      false
    );
  }

  public buildVetoVotingSetupTx(): SafeTransaction {
    const subDaoData = this.daoData as SubDAO;

    return buildContractCall(
      this.vetoVotingType.connect(this.vetoVotingAddress, this.signerOrProvider),
      'setUp',
      [
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
          [
            this.parentAddress, // Owner -- Parent DAO
            subDaoData.vetoVotesThreshold, // VetoVotesThreshold
            subDaoData.freezeVotesThreshold, // FreezeVotesThreshold
            subDaoData.freezeProposalPeriod, // FreezeProposalPeriod
            subDaoData.freezePeriod, // FreezePeriod
            this.parentTokenAddress ?? this.parentAddress, // ParentGnosisSafe or Votes Token
            this.vetoGuardAddress, // MultisigFreezeGuard
          ]
        ),
      ],
      0,
      false
    );
  }

  public buildSetGuardTx(contract: GnosisSafe | Azorius): SafeTransaction {
    return buildContractCall(contract, 'setGuard', [this.vetoGuardAddress], 0, false);
  }

  public buildDeployVetoGuardTx() {
    return buildDeployZodiacModuleTx(this.baseContracts.zodiacModuleProxyFactoryContract, [
      this.getGuardMasterCopyAddress(),
      this.vetoGuardCallData!,
      this.saltNum,
    ]);
  }

  /**
   * Methods to generate veto voting and guard addresses
   * As well as calldata needed to create deploy Txs
   */

  private setVetoVotingTypeAndCallData() {
    this.vetoVotingType = this.parentTokenAddress
      ? ERC20FreezeVoting__factory
      : MultisigFreezeVoting__factory;

    this.vetoVotingCallData = this.vetoVotingType.createInterface().encodeFunctionData('owner');
  }

  private setVetoVotingAddress() {
    const vetoVotesMasterCopyContract = this.parentTokenAddress
      ? this.baseContracts.vetoERC20VotingMasterCopyContract
      : this.baseContracts.vetoMultisigVotingMasterCopyContract;

    const vetoVotingByteCodeLinear = generateContractByteCodeLinear(
      vetoVotesMasterCopyContract.address.slice(2)
    );

    this.vetoVotingAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      generateSalt(this.vetoVotingCallData!, this.saltNum),
      solidityKeccak256(['bytes'], [vetoVotingByteCodeLinear])
    );
  }

  private setVetoGuardAddress() {
    const vetoGuardByteCodeLinear = generateContractByteCodeLinear(
      this.getGuardMasterCopyAddress().slice(2)
    );
    const vetoGuardSalt = generateSalt(this.vetoGuardCallData!, this.saltNum);

    this.vetoGuardAddress = generatePredictedModuleAddress(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      vetoGuardSalt,
      vetoGuardByteCodeLinear
    );
  }

  private setVetoGuardData() {
    if (this.azoriusAddress) {
      this.setVetoGuardCallDataAzorius();
    } else {
      this.setVetoGuardCallDataMultisig();
    }
  }

  private setVetoGuardCallDataMultisig() {
    const subDaoData = this.daoData as SubDAO;

    this.vetoGuardCallData = MultisigFreezeGuard__factory.createInterface().encodeFunctionData(
      'setUp',
      [
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'uint256', 'address', 'address', 'address'],
          [
            subDaoData.timelockPeriod, // Timelock Period
            subDaoData.executionPeriod, // Execution Period
            this.parentAddress, // Owner -- Parent DAO
            this.vetoVotingAddress, // Veto Voting
            this.safeContract.address, // Gnosis Safe
          ]
        ),
      ]
    );
  }

  private setVetoGuardCallDataAzorius() {
    const subDaoData = this.daoData as SubDAO;

    this.vetoGuardCallData = AzoriusFreezeGuard__factory.createInterface().encodeFunctionData(
      'setUp',
      [
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'address', 'address', 'address', 'uint256'],
          [
            this.parentAddress, // Owner -- Parent DAO
            this.vetoVotingAddress, // Veto Voting
            this.strategyAddress, // Base Strategy
            this.azoriusAddress, // Azorius
            subDaoData.executionPeriod, // Execution Period
          ]
        ),
      ]
    );
  }

  private getGuardMasterCopyAddress(): string {
    return this.azoriusContracts
      ? this.azoriusContracts.azoriusVetoGuardMasterCopyContract.address
      : this.baseContracts.gnosisVetoGuardMasterCopyContract.address;
  }
}
