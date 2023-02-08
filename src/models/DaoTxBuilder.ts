import {
  GnosisSafe,
  GnosisSafe__factory,
  VetoERC20Voting__factory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { GnosisDAO, SubDAO, TokenGovernanceDAO } from '../components/DaoCreator/provider/types';
import { buildContractCall, encodeMultiSend, getRandomBytes } from '../helpers';
import { fractalModuleData, FractalModuleData } from '../helpers/BuildDAOTx/fractalModuleData';
import { gnosisSafeData } from '../helpers/BuildDAOTx/gnosisSafeData';
import { TIMER_MULT } from '../helpers/BuildDAOTx/utils';
import { vetoGuardDataMultisig } from '../helpers/BuildDAOTx/vetoGuardData';
import { vetoVotesData } from '../helpers/BuildDAOTx/vetoVotesData';
import { SafeTransaction } from '../types';
import { BaseContracts, UsulContracts } from './types/contracts';

const { AddressZero } = ethers.constants;

export class DaoTxBuilder {
  private baseContracts: BaseContracts;
  private readonly usulContracts: UsulContracts | undefined;
  private readonly daoData: GnosisDAO | TokenGovernanceDAO;
  private readonly signerOrProvider: ethers.Signer | any;
  private readonly parentDAOAddress?: string;
  private readonly parentTokenAddress?: string;

  // Salt used to generate transactions
  private readonly saltNum;

  // Gnosis Safe Data
  public predictedGnosisSafeAddress: string | undefined;
  public createSafeTx: SafeTransaction | undefined;
  private safeContract: GnosisSafe | undefined;

  // Fractal Module
  private predictedFractalModuleAddress: string | undefined;
  private deployFractalModuleTx: SafeTransaction | undefined;

  // Internal Txs
  private internalTxs: SafeTransaction[] = [];

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    usulContracts: UsulContracts | undefined,
    daoData: GnosisDAO | TokenGovernanceDAO,
    parentDAOAddress?: string,
    parentTokenAddress?: string
  ) {
    this.signerOrProvider = signerOrProvider;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.usulContracts = usulContracts;
    this.parentDAOAddress = parentDAOAddress;
    this.parentTokenAddress = parentTokenAddress;

    this.saltNum = getRandomBytes();
  }

  public async setupGnosisSafeData(): Promise<void> {
    const { predictedGnosisSafeAddress, createSafeTx } = await gnosisSafeData(
      this.baseContracts.multiSendContract,
      this.baseContracts.gnosisSafeFactoryContract,
      this.baseContracts.gnosisSafeSingletonContract,
      this.daoData as GnosisDAO,
      this.saltNum
    );

    const safeContract = GnosisSafe__factory.connect(
      predictedGnosisSafeAddress,
      this.signerOrProvider
    );

    this.predictedGnosisSafeAddress = predictedGnosisSafeAddress;
    this.createSafeTx = createSafeTx;
    this.safeContract = safeContract;
  }

  public setupFractalModuleData(): void {
    const { predictedFractalModuleAddress, deployFractalModuleTx }: FractalModuleData =
      fractalModuleData(
        this.baseContracts.fractalModuleMasterCopyContract,
        this.baseContracts.zodiacModuleProxyFactoryContract,
        this.safeContract!,
        this.saltNum,
        this.parentDAOAddress
      );

    this.predictedFractalModuleAddress = predictedFractalModuleAddress;
    this.deployFractalModuleTx = deployFractalModuleTx;
  }

  public async buildMultisigTx(): Promise<string> {
    const gnosisDaoData = this.daoData as GnosisDAO;

    const signatures =
      '0x000000000000000000000000' +
      this.baseContracts.multiSendContract.address.slice(2) +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '01';

    this.internalTxs.push(
      buildContractCall(
        this.baseContracts.fractalRegistryContract,
        'updateDAOName',
        [gnosisDaoData.daoName],
        0,
        false
      )
    );

    if (this.parentDAOAddress) {
      const subDAOData = this.daoData as SubDAO;

      // Veto Votes
      const { vetoVotingAddress, setVetoVotingCalldata, vetoVotesType } = await vetoVotesData(
        this.baseContracts.vetoERC20VotingMasterCopyContract,
        this.baseContracts.vetoMultisigVotingMasterCopyContract,
        this.baseContracts.zodiacModuleProxyFactoryContract,
        this.saltNum,
        this.parentTokenAddress
      );

      // Veto Guard
      const { predictedVetoModuleAddress, deployVetoGuardTx } = vetoGuardDataMultisig(
        this.baseContracts.gnosisVetoGuardMasterCopyContract,
        this.baseContracts.zodiacModuleProxyFactoryContract,
        subDAOData.executionPeriod,
        this.parentDAOAddress,
        vetoVotingAddress,
        this.safeContract!.address,
        this.saltNum,
        subDAOData.timelockPeriod
      );

      this.internalTxs.concat([
        // Enable Fractal Module b/c this DAO has a parent
        buildContractCall(
          this.safeContract!,
          'enableModule',
          [this.predictedFractalModuleAddress],
          0,
          false
        ),
        // Deploy Veto Voting
        buildContractCall(
          this.baseContracts.zodiacModuleProxyFactoryContract,
          'deployModule',
          [
            vetoVotesType === VetoERC20Voting__factory
              ? this.baseContracts.vetoERC20VotingMasterCopyContract.address
              : this.baseContracts.vetoMultisigVotingMasterCopyContract.address,
            setVetoVotingCalldata,
            this.saltNum,
          ],
          0,
          false
        ),
        // Setup Veto Voting
        buildContractCall(
          vetoVotesType.connect(vetoVotingAddress, this.signerOrProvider),
          'setUp',
          [
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
              [
                this.parentDAOAddress, // Owner -- Parent DAO
                subDAOData.vetoVotesThreshold, // VetoVotesThreshold
                subDAOData.freezeVotesThreshold, // FreezeVotesThreshold
                subDAOData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
                subDAOData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
                this.parentTokenAddress ?? this.parentDAOAddress, // ParentGnosisSafe or Votes Token
                predictedVetoModuleAddress, // VetoGuard
              ]
            ),
          ],
          0,
          false
        ),
        // Deploy Veto Guard
        deployVetoGuardTx,
        // Enable Veto Guard
        buildContractCall(this.safeContract!, 'setGuard', [predictedVetoModuleAddress], 0, false),
      ]);
    }

    // Remove Multisend Contract as owner
    // This will be final TX for rootDAO and subDAO
    this.internalTxs.push(
      buildContractCall(
        this.safeContract!,
        'removeOwner',
        [
          gnosisDaoData.trustedAddresses[gnosisDaoData.trustedAddresses.length - 1].address,
          this.baseContracts.multiSendContract.address,
          gnosisDaoData.signatureThreshold,
        ],
        0,
        false
      )
    );

    const safeInternalTx = encodeMultiSend(this.internalTxs);
    const execInternalSafeTx = buildContractCall(
      this.safeContract!,
      'execTransaction',
      [
        this.baseContracts.multiSendContract.address, // to
        '0', // value
        this.baseContracts.multiSendContract.interface.encodeFunctionData('multiSend', [
          safeInternalTx,
        ]), // calldata
        '1', // operation
        '0', // tx gas
        '0', // base gas
        '0', // gas price
        AddressZero, // gas token
        AddressZero, // receiver
        signatures, // sigs
      ],
      0,
      false
    );

    const txs: SafeTransaction[] = [this.createSafeTx!, execInternalSafeTx];

    // If childDAO, deploy Fractal Module
    if (this.parentDAOAddress) {
      txs.splice(1, 0, this.deployFractalModuleTx!);
    }

    return encodeMultiSend(txs);
  }

  isUsul(): boolean {
    return !!this.usulContracts;
  }
}
