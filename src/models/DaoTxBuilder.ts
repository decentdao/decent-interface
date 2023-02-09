import { GnosisSafe } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { GnosisDAO, TokenGovernanceDAO } from '../components/DaoCreator/provider/types';
import { buildContractCall, encodeMultiSend } from '../helpers';
import { SafeTransaction } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { TxBuilderFactory } from './TxBuilderFactory';
import { fractalModuleData, FractalModuleData } from './helpers/fractalModuleData';
import { BaseContracts, UsulContracts } from './types/contracts';

const { AddressZero } = ethers.constants;

export class DaoTxBuilder extends BaseTxBuilder {
  private readonly saltNum;

  private txBuilderFactory: TxBuilderFactory;

  // Gnosis Safe Data
  private predictedGnosisSafeAddress: string;
  private createSafeTx: SafeTransaction;
  private safeContract: GnosisSafe;

  // Fractal Module Txs
  private enableFractalModuleTx: SafeTransaction | undefined;
  private deployFractalModuleTx: SafeTransaction | undefined;

  private internalTxs: SafeTransaction[] = [];

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    usulContracts: UsulContracts | undefined,
    daoData: GnosisDAO | TokenGovernanceDAO,
    saltNum: string,
    predictedGnosisSafeAddress: string,
    createSafeTx: SafeTransaction,
    safeContract: GnosisSafe,
    txBuilderFactory: TxBuilderFactory,
    parentDAOAddress?: string,
    parentTokenAddress?: string
  ) {
    super(
      signerOrProvider,
      baseContracts,
      usulContracts,
      daoData,
      parentDAOAddress,
      parentTokenAddress
    );

    this.predictedGnosisSafeAddress = predictedGnosisSafeAddress;
    this.createSafeTx = createSafeTx;
    this.safeContract = safeContract;
    this.txBuilderFactory = txBuilderFactory;
    this.saltNum = saltNum;

    // Prep fractal module txs for setting up subDAOs
    this.setFractalModuleTxs();
  }

  public async buildUsulTx(): Promise<string> {
    const usulTxBuilder = this.txBuilderFactory.createUsulTxBuilder();

    this.internalTxs = [
      this.buildUpdateDAONameTx(),
      usulTxBuilder.buildLinearVotingContractSetupTx(),
      usulTxBuilder.buildEnableUsulModuleTx(),
    ];

    if (this.parentDAOAddress) {
      const vetoGuardTxBuilder = this.txBuilderFactory.createVetoGuardTxBuilder();

      this.internalTxs = this.internalTxs.concat([
        // Enable Fractal Module b/c this a subDAO
        this.enableFractalModuleTx!,
        vetoGuardTxBuilder.buildDeployZodiacModuleTx(),
        vetoGuardTxBuilder.buildVetoVotingSetupTx(),
        vetoGuardTxBuilder.buildDeployVetoGuardTx(),
        vetoGuardTxBuilder.buildSetGuardTx(usulTxBuilder.usulContract!),
      ]);
    }

    this.internalTxs = this.internalTxs.concat([
      usulTxBuilder.buildAddUsulContractAsOwnerTx(),
      usulTxBuilder.buildRemoveMultiSendOwnerTx(),
    ]);

    const txs: SafeTransaction[] = [
      this.createSafeTx!,
      usulTxBuilder.buildCreateTokenTx(),
      usulTxBuilder.buildDeployStrategyTx(),
      usulTxBuilder.buildDeployUsulTx(),
    ];

    // If childDAO, deploy Fractal Module
    if (this.parentDAOAddress) {
      txs.push(this.deployFractalModuleTx!);
    }

    txs.push(this.buildExecInternalSafeTx(usulTxBuilder.signatures()));

    return encodeMultiSend(txs);
  }

  public async buildMultisigTx(): Promise<string> {
    const multisigTxBuilder = this.txBuilderFactory.createMultiSigTxBuilder();

    this.internalTxs.push(this.buildUpdateDAONameTx());

    if (this.parentDAOAddress) {
      const vetoGuardTxBuilder = this.txBuilderFactory.createVetoGuardTxBuilder();

      this.internalTxs = this.internalTxs.concat([
        // Enable Fractal Module b/c this a subDAO
        this.enableFractalModuleTx!,
        vetoGuardTxBuilder.buildDeployZodiacModuleTx(),
        vetoGuardTxBuilder.buildVetoVotingSetupTx(),
        vetoGuardTxBuilder.buildDeployVetoGuardTx(),
        vetoGuardTxBuilder.buildSetGuardTx(this.safeContract),
      ]);
    }

    this.internalTxs.push(multisigTxBuilder.buildRemoveMultiSendOwnerTx());

    const txs: SafeTransaction[] = [
      this.createSafeTx!,
      this.buildExecInternalSafeTx(multisigTxBuilder.signatures()),
    ];

    // If childDAO, deploy Fractal Module after safe creation
    if (this.parentDAOAddress) {
      txs.splice(1, 0, this.deployFractalModuleTx!);
    }

    return encodeMultiSend(txs);
  }

  //
  // Setup Fractal Txs for use by
  // both Multisig + Usul subDAOs
  //

  private setFractalModuleTxs(): void {
    const { enableFractalModuleTx, deployFractalModuleTx }: FractalModuleData = fractalModuleData(
      this.baseContracts.fractalModuleMasterCopyContract,
      this.baseContracts.zodiacModuleProxyFactoryContract,
      this.safeContract!,
      this.saltNum,
      this.parentDAOAddress
    );

    this.enableFractalModuleTx = enableFractalModuleTx;
    this.deployFractalModuleTx = deployFractalModuleTx;
  }

  //
  // Txs shared by all DAO types
  //

  private buildUpdateDAONameTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.fractalRegistryContract,
      'updateDAOName',
      [this.daoData.daoName],
      0,
      false
    );
  }

  private buildExecInternalSafeTx(signatures: string): SafeTransaction {
    const safeInternalTx = encodeMultiSend(this.internalTxs);
    return buildContractCall(
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
  }
}
