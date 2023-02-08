import {
  GnosisSafe,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { SubDAO } from '../components/DaoCreator/provider/types';
import { buildContractCall } from '../helpers';
import {
  buildDeployZodiacModuleTx,
  generateContractByteCodeLinear,
  generatePredictedModuleAddress,
  generateSalt,
  TIMER_MULT,
} from '../helpers/BuildDAOTx/utils';
import { SafeTransaction } from '../types';
import { BaseContracts } from './types/contracts';

export class VetoGuardTxBuilder {
  private baseContracts: BaseContracts;

  private readonly daoData: SubDAO;

  private readonly parentDAOAddress: string;

  private readonly parentTokenAddress?: string;

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

  constructor(
    baseContracts: BaseContracts,
    daoData: SubDAO,
    safeContract: GnosisSafe,
    saltNum: string,
    parentDAOAddress: string,
    parentTokenAddress?: string
  ) {
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.parentDAOAddress = parentDAOAddress;
    this.safeContract = safeContract;
    this.parentTokenAddress = parentTokenAddress;
    this.saltNum = saltNum;

    this.initVetoVotesData();
  }

  initVetoVotesData() {
    this.setVetoVotingTypeAndCallData();
    this.setVetoVotingAddress();
    this.setVetoGuardCallDataMultisig();
    this.setVetoGuardAddress();
  }

  public buildDeployZodiacModuleTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.vetoVotingType === VetoERC20Voting__factory
          ? this.baseContracts.vetoERC20VotingMasterCopyContract.address
          : this.baseContracts.vetoMultisigVotingMasterCopyContract.address,
        this.vetoVotingCallData,
        this.saltNum,
      ],
      0,
      false
    );
  }

  public buildVetoVotingSetupTx(signerOrProvider: any): SafeTransaction {
    return buildContractCall(
      this.vetoVotingType.connect(this.vetoVotingAddress, signerOrProvider),
      'setUp',
      [
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
          [
            this.parentDAOAddress, // Owner -- Parent DAO
            this.daoData.vetoVotesThreshold, // VetoVotesThreshold
            this.daoData.freezeVotesThreshold, // FreezeVotesThreshold
            this.daoData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
            this.daoData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
            this.parentTokenAddress ?? this.parentDAOAddress, // ParentGnosisSafe or Votes Token
            this.vetoGuardAddress, // VetoGuard
          ]
        ),
      ],
      0,
      false
    );
  }

  public buildSetGuardTx(): SafeTransaction {
    return buildContractCall(this.safeContract!, 'setGuard', [this.vetoGuardAddress], 0, false);
  }

  public buildDeployVetoGuardTx() {
    return buildDeployZodiacModuleTx(this.baseContracts.zodiacModuleProxyFactoryContract, [
      this.baseContracts.gnosisVetoGuardMasterCopyContract.address,
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
      ? VetoERC20Voting__factory
      : VetoMultisigVoting__factory;

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
    const guardAddress = this.baseContracts.gnosisVetoGuardMasterCopyContract.address;
    const vetoGuardByteCodeLinear = generateContractByteCodeLinear(guardAddress.slice(2));
    const vetoGuardSalt = generateSalt(this.vetoGuardCallData!, this.saltNum);

    this.vetoGuardAddress = generatePredictedModuleAddress(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      vetoGuardSalt,
      vetoGuardByteCodeLinear
    );
  }

  private setVetoGuardCallDataMultisig() {
    this.vetoGuardCallData = VetoGuard__factory.createInterface().encodeFunctionData('setUp', [
      ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'uint256', 'address', 'address', 'address'],
        [
          this.daoData.timelockPeriod?.mul(TIMER_MULT), // Timelock Period
          this.daoData.executionPeriod.mul(TIMER_MULT), // Execution Period
          this.parentDAOAddress, // Owner -- Parent DAO
          this.vetoVotingAddress, // Veto Voting
          this.safeContract.address, // Gnosis Safe
        ]
      ),
    ]);
  }
}
