import {
  FractalUsul,
  GnosisSafe,
  UsulVetoGuard__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { SubDAO } from '../components/DaoCreator/types';
import { buildContractCall } from '../helpers';
import { SafeTransaction } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import {
  buildDeployZodiacModuleTx,
  generateContractByteCodeLinear,
  generatePredictedModuleAddress,
  generateSalt,
  TIMER_MULT,
} from './helpers/utils';
import { BaseContracts, UsulContracts } from './types/contracts';

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

  // Usul Data
  private usulAddress: string | undefined;
  private strategyAddress: string | undefined;

  constructor(
    signerOrProvider: any,
    baseContracts: BaseContracts,
    daoData: SubDAO,
    safeContract: GnosisSafe,
    saltNum: string,
    parentDAOAddress: string,
    parentTokenAddress?: string,
    usulContracts?: UsulContracts,
    usulAddress?: string,
    strategyAddress?: string
  ) {
    super(
      signerOrProvider,
      baseContracts,
      usulContracts,
      daoData,
      parentDAOAddress,
      parentTokenAddress
    );

    this.safeContract = safeContract;
    this.saltNum = saltNum;
    this.usulAddress = usulAddress;
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

  public buildVetoVotingSetupTx(): SafeTransaction {
    const subDaoData = this.daoData as SubDAO;

    return buildContractCall(
      this.vetoVotingType.connect(this.vetoVotingAddress, this.signerOrProvider),
      'setUp',
      [
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
          [
            this.parentDAOAddress, // Owner -- Parent DAO
            subDaoData.vetoVotesThreshold, // VetoVotesThreshold
            subDaoData.freezeVotesThreshold, // FreezeVotesThreshold
            subDaoData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
            subDaoData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
            this.parentTokenAddress ?? this.parentDAOAddress, // ParentGnosisSafe or Votes Token
            this.vetoGuardAddress, // VetoGuard
          ]
        ),
      ],
      0,
      false
    );
  }

  public buildSetGuardTx(contract: GnosisSafe | FractalUsul): SafeTransaction {
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
    if (this.usulAddress) {
      this.setVetoGuardCallDataUsul();
    } else {
      this.setVetoGuardCallDataMultisig();
    }
  }

  private setVetoGuardCallDataMultisig() {
    const subDaoData = this.daoData as SubDAO;

    this.vetoGuardCallData = VetoGuard__factory.createInterface().encodeFunctionData('setUp', [
      ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'uint256', 'address', 'address', 'address'],
        [
          subDaoData.timelockPeriod?.mul(TIMER_MULT), // Timelock Period
          subDaoData.executionPeriod.mul(TIMER_MULT), // Execution Period
          this.parentDAOAddress, // Owner -- Parent DAO
          this.vetoVotingAddress, // Veto Voting
          this.safeContract.address, // Gnosis Safe
        ]
      ),
    ]);
  }

  private setVetoGuardCallDataUsul() {
    const subDaoData = this.daoData as SubDAO;

    this.vetoGuardCallData = UsulVetoGuard__factory.createInterface().encodeFunctionData('setUp', [
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address', 'address', 'uint256'],
        [
          this.parentDAOAddress, // Owner -- Parent DAO
          this.vetoVotingAddress, // Veto Voting
          this.strategyAddress, // Base Strategy
          this.usulAddress, // USUL
          subDaoData.executionPeriod.mul(TIMER_MULT), // Execution Period
        ]
      ),
    ]);
  }

  private getGuardMasterCopyAddress(): string {
    return this.usulContracts
      ? this.usulContracts.usulVetoGuardMasterCopyContract.address
      : this.baseContracts.gnosisVetoGuardMasterCopyContract.address;
  }
}
