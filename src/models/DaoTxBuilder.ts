import { ethers } from 'ethers';
import { Address, PublicClient, encodeFunctionData, getAddress, zeroAddress } from 'viem';
import AzoriusAbi from '../assets/abi/Azorius';
import FractalRegistryAbi from '../assets/abi/FractalRegistry';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import KeyValuePairsAbi from '../assets/abi/KeyValuePairs';
import MultiSendCallOnlyAbi from '../assets/abi/MultiSendCallOnly';
import { buildContractCallViem, encodeMultiSend } from '../helpers';
import {
  BaseContracts,
  SafeMultisigDAO,
  SafeTransaction,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
  VotingStrategyType,
} from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { TxBuilderFactory } from './TxBuilderFactory';
import { fractalModuleData, FractalModuleData } from './helpers/fractalModuleData';

export class DaoTxBuilder extends BaseTxBuilder {
  private readonly saltNum;

  private txBuilderFactory: TxBuilderFactory;

  // Safe Data
  private readonly createSafeTx: SafeTransaction;
  private readonly safeContractAddress: Address;
  private readonly parentStrategyType?: VotingStrategyType;
  private readonly parentStrategyAddress?: string;

  // Fractal Module Txs
  private enableFractalModuleTx: SafeTransaction | undefined;
  private deployFractalModuleTx: SafeTransaction | undefined;

  private internalTxs: SafeTransaction[] = [];

  private readonly keyValuePairsAddress: string;
  private readonly fractalRegistryAddress: string;
  private readonly moduleProxyFactoryAddress: string;
  private readonly multiSendCallOnlyAddress: string;
  private readonly fractalModuleMasterCopyAddress: string;

  constructor(
    signerOrProvider: ethers.Signer | any,
    publicClient: PublicClient,
    baseContracts: BaseContracts,
    isAzorius: boolean,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
    saltNum: bigint,
    createSafeTx: SafeTransaction,
    safeContractAddress: Address,
    txBuilderFactory: TxBuilderFactory,
    keyValuePairsAddress: string,
    fractalRegistryAddress: string,
    moduleProxyFactoryAddress: string,
    multiSendCallOnlyAddress: string,
    fractalModuleMasterCopyAddress: string,
    parentAddress?: string,
    parentTokenAddress?: string,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: string,
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

    this.createSafeTx = createSafeTx;
    this.safeContractAddress = safeContractAddress;
    this.txBuilderFactory = txBuilderFactory;
    this.saltNum = saltNum;
    this.parentStrategyType = parentStrategyType;
    this.parentStrategyAddress = parentStrategyAddress;

    this.keyValuePairsAddress = keyValuePairsAddress;
    this.fractalRegistryAddress = fractalRegistryAddress;
    this.moduleProxyFactoryAddress = moduleProxyFactoryAddress;
    this.multiSendCallOnlyAddress = multiSendCallOnlyAddress;
    this.fractalModuleMasterCopyAddress = fractalModuleMasterCopyAddress;

    // Prep fractal module txs for setting up subDAOs
    this.setFractalModuleTxs();
  }

  public async buildAzoriusTx(
    shouldSetName: boolean = true,
    shouldSetSnapshot: boolean = true,
    existingSafe?: { owners: string[] },
  ): Promise<string> {
    const azoriusTxBuilder = await this.txBuilderFactory.createAzoriusTxBuilder();

    // transactions that must be called by safe
    this.internalTxs = [];
    const txs: SafeTransaction[] = !!existingSafe ? [] : [this.createSafeTx!];

    if (shouldSetName) {
      this.internalTxs = this.internalTxs.concat(this.buildUpdateDAONameTx());
    }

    if (shouldSetSnapshot) {
      this.internalTxs = this.internalTxs.concat(this.buildUpdateDAOSnapshotENSTx());
    }

    this.internalTxs = this.internalTxs.concat(
      azoriusTxBuilder.buildVotingContractSetupTx(),
      azoriusTxBuilder.buildEnableAzoriusModuleTx(),
    );

    if (this.parentAddress) {
      const freezeGuardTxBuilder = this.txBuilderFactory.createFreezeGuardTxBuilder(
        azoriusTxBuilder.azoriusAddress,
        azoriusTxBuilder.linearERC20VotingAddress ?? azoriusTxBuilder.linearERC721VotingAddress,
        this.parentStrategyType,
        this.parentStrategyAddress,
      );

      this.internalTxs = this.internalTxs.concat([
        // Enable Fractal Module b/c this a subDAO
        this.enableFractalModuleTx!,
        freezeGuardTxBuilder.buildDeployZodiacModuleTx(),
        freezeGuardTxBuilder.buildFreezeVotingSetupTx(),
        freezeGuardTxBuilder.buildDeployFreezeGuardTx(),
        freezeGuardTxBuilder.buildSetGuardTx(AzoriusAbi, azoriusTxBuilder.azoriusAddress!),
      ]);
    }
    const data = this.daoData as AzoriusERC20DAO;

    this.internalTxs = this.internalTxs.concat([
      azoriusTxBuilder.buildAddAzoriusContractAsOwnerTx(),
      ...(!!existingSafe ? azoriusTxBuilder.buildRemoveOwners(existingSafe.owners) : []),
      azoriusTxBuilder.buildRemoveMultiSendOwnerTx(),
    ]);

    // build token wrapper if token is imported and not votes token (votes token contracts is already deployed)
    if (data.isTokenImported && !data.isVotesToken && data.tokenImportAddress) {
      txs.push(azoriusTxBuilder.buildCreateTokenWrapperTx());
    }
    // build token if token is not imported
    if (!data.isTokenImported && data.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      txs.push(azoriusTxBuilder.buildCreateTokenTx());
    }

    txs.push(azoriusTxBuilder.buildDeployStrategyTx());
    txs.push(azoriusTxBuilder.buildDeployAzoriusTx());

    // If subDAO and parentAllocation, deploy claim module
    let tokenClaimTx: SafeTransaction | undefined;
    const parentAllocation = (this.daoData as AzoriusERC20DAO).parentAllocationAmount;

    if (this.parentTokenAddress && parentAllocation && parentAllocation !== 0n) {
      const tokenApprovalTx = azoriusTxBuilder.buildApproveClaimAllocation();
      if (!tokenApprovalTx) {
        throw new Error('buildApproveClaimAllocation returned undefined');
      }
      tokenClaimTx = azoriusTxBuilder.buildDeployTokenClaim();
      this.internalTxs.push(tokenApprovalTx);
    }

    // If subDAO, deploy Fractal Module
    if (this.parentAddress) {
      txs.push(this.deployFractalModuleTx!);
    }

    txs.push(this.buildExecInternalSafeTx(azoriusTxBuilder.signatures()));

    // token claim deployment tx is pushed at the end to ensure approval is executed first
    if (tokenClaimTx) {
      txs.push(tokenClaimTx);
    }

    return encodeMultiSend(txs);
  }

  public async buildMultisigTx(): Promise<string> {
    const multisigTxBuilder = this.txBuilderFactory.createMultiSigTxBuilder();

    this.internalTxs.push(this.buildUpdateDAONameTx());
    this.internalTxs.push(this.buildUpdateDAOSnapshotENSTx());

    // subDAO case, add freeze guard
    if (this.parentAddress) {
      const freezeGuardTxBuilder = this.txBuilderFactory.createFreezeGuardTxBuilder(
        undefined,
        undefined,
        this.parentStrategyType,
        this.parentStrategyAddress,
      );

      this.internalTxs = this.internalTxs.concat([
        // Enable Fractal Module b/c this a subDAO
        this.enableFractalModuleTx!,
        freezeGuardTxBuilder.buildDeployZodiacModuleTx(),
        freezeGuardTxBuilder.buildFreezeVotingSetupTx(),
        freezeGuardTxBuilder.buildDeployFreezeGuardTx(),
        freezeGuardTxBuilder.buildSetGuardTxSafe(this.safeContractAddress),
      ]);
    }

    this.internalTxs.push(multisigTxBuilder.buildRemoveMultiSendOwnerTx());

    const txs: SafeTransaction[] = [
      this.createSafeTx!,
      this.buildExecInternalSafeTx(multisigTxBuilder.signatures()),
    ];

    // If subDAO, deploy Fractal Module.
    if (this.parentAddress) {
      txs.splice(1, 0, this.deployFractalModuleTx!);
    }

    return encodeMultiSend(txs);
  }

  //
  // Setup Fractal Txs for use by
  // both Multisig + Azorius subDAOs
  //

  private setFractalModuleTxs(): void {
    const { enableFractalModuleTx, deployFractalModuleTx }: FractalModuleData = fractalModuleData(
      getAddress(this.fractalModuleMasterCopyAddress),
      getAddress(this.moduleProxyFactoryAddress),
      this.safeContractAddress,
      this.saltNum,
      !this.parentAddress ? undefined : getAddress(this.parentAddress),
    );

    this.enableFractalModuleTx = enableFractalModuleTx;
    this.deployFractalModuleTx = deployFractalModuleTx;
  }

  //
  // Txs shared by all DAO types
  //

  private buildUpdateDAONameTx(): SafeTransaction {
    return buildContractCallViem(
      FractalRegistryAbi,
      getAddress(this.fractalRegistryAddress),
      'updateDAOName',
      [this.daoData.daoName],
      0,
      false,
    );
  }

  private buildUpdateDAOSnapshotENSTx(): SafeTransaction {
    return buildContractCallViem(
      KeyValuePairsAbi,
      getAddress(this.keyValuePairsAddress),
      'updateValues',
      [['snapshotENS'], [this.daoData.snapshotENS]],
      0,
      false,
    );
  }

  private buildExecInternalSafeTx(signatures: string): SafeTransaction {
    const safeInternalTx = encodeMultiSend(this.internalTxs);
    return buildContractCallViem(
      GnosisSafeL2Abi,
      this.safeContractAddress,
      'execTransaction',
      [
        this.multiSendCallOnlyAddress, // to
        '0', // value
        encodeFunctionData({
          abi: MultiSendCallOnlyAbi,
          functionName: 'multiSend',
          args: [safeInternalTx],
        }), // calldata
        '1', // operation
        '0', // tx gas
        '0', // base gas
        '0', // gas price
        zeroAddress, // gas token
        zeroAddress, // receiver
        signatures, // sigs
      ],
      0,
      false,
    );
  }
}
