import { GnosisSafe, GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getRandomBytes } from '../helpers';
import {
  BaseContracts,
  SafeMultisigDAO,
  SafeTransaction,
  SubDAO,
  AzoriusERC721DAO,
  AzoriusContracts,
  AzoriusERC20DAO,
  VotingStrategyType,
} from '../types';
import { AzoriusTxBuilder } from './AzoriusTxBuilder';
import { BaseTxBuilder } from './BaseTxBuilder';
import { DaoTxBuilder } from './DaoTxBuilder';
import { FreezeGuardTxBuilder } from './FreezeGuardTxBuilder';
import { MultisigTxBuilder } from './MultisigTxBuilder';
import { safeData } from './helpers/safeData';

export class TxBuilderFactory extends BaseTxBuilder {
  private readonly saltNum: string;

  // Safe Data
  public predictedSafeAddress: string | undefined;
  public createSafeTx: SafeTransaction | undefined;
  private safeContract: GnosisSafe | undefined;

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts | undefined,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
    parentAddress?: string,
    parentTokenAddress?: string
  ) {
    super(
      signerOrProvider,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress
    );

    this.saltNum = getRandomBytes();
  }

  public setSafeContract(safeAddress: string) {
    const safeContract = GnosisSafe__factory.connect(safeAddress, this.signerOrProvider);
    this.safeContract = safeContract;
  }

  public async setupSafeData(): Promise<void> {
    const { predictedSafeAddress, createSafeTx } = await safeData(
      this.baseContracts.multiSendContract,
      this.baseContracts.safeFactoryContract,
      this.baseContracts.safeSingletonContract,
      this.daoData as SafeMultisigDAO,
      this.saltNum,
      !!this.azoriusContracts
    );

    this.predictedSafeAddress = predictedSafeAddress;
    this.createSafeTx = createSafeTx;

    this.setSafeContract(predictedSafeAddress);
  }

  public createDaoTxBuilder(
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: string
  ): DaoTxBuilder {
    return new DaoTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.azoriusContracts,
      this.daoData,
      this.saltNum,
      this.predictedSafeAddress!,
      this.createSafeTx!,
      this.safeContract!,
      this,
      this.parentAddress,
      this.parentTokenAddress,
      parentStrategyType,
      parentStrategyAddress
    );
  }

  public createFreezeGuardTxBuilder(
    azoriusAddress?: string,
    strategyAddress?: string,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: string // User only with ERC-721 parent
  ): FreezeGuardTxBuilder {
    return new FreezeGuardTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.daoData as SubDAO,
      this.safeContract!,
      this.saltNum,
      this.parentAddress!,
      this.parentTokenAddress,
      this.azoriusContracts,
      azoriusAddress,
      strategyAddress,
      parentStrategyType,
      parentStrategyAddress
    );
  }

  public createMultiSigTxBuilder(): MultisigTxBuilder {
    return new MultisigTxBuilder(
      this.baseContracts,
      this.daoData as SafeMultisigDAO,
      this.safeContract!
    );
  }

  public async createAzoriusTxBuilder(): Promise<AzoriusTxBuilder> {
    const azoriusTxBuilder = new AzoriusTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.azoriusContracts!,
      this.daoData as AzoriusERC20DAO,
      this.safeContract!,
      this.predictedSafeAddress!,
      this.parentAddress,
      this.parentTokenAddress
    );

    await azoriusTxBuilder.init();
    return azoriusTxBuilder;
  }
}
