import { ethers } from 'ethers';
import { getAddress } from 'viem';
import { GnosisSafeL2 } from '../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { GnosisSafeL2__factory } from '../assets/typechain-types/usul/factories/@gnosis.pm/safe-contracts/contracts';
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
  private readonly saltNum: bigint;

  // Safe Data
  public predictedSafeAddress: string | undefined;
  public createSafeTx: SafeTransaction | undefined;
  private safeContract: GnosisSafeL2 | undefined;
  public fallbackHandler: string;

  private votesERC20WrapperMasterCopyAddress: string;

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts | undefined,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
    fallbackHandler: string,
    votesERC20WrapperMasterCopyAddress: string,
    parentAddress?: string,
    parentTokenAddress?: string,
  ) {
    super(
      signerOrProvider,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress,
    );

    this.fallbackHandler = fallbackHandler;
    this.saltNum = getRandomBytes();
    this.votesERC20WrapperMasterCopyAddress = votesERC20WrapperMasterCopyAddress;
  }

  public setSafeContract(safeAddress: string) {
    const safeContract = GnosisSafeL2__factory.connect(safeAddress, this.signerOrProvider);
    this.safeContract = safeContract;
  }

  public async setupSafeData(): Promise<void> {
    const { predictedSafeAddress, createSafeTx } = await safeData(
      this.baseContracts.multiSendContract,
      this.baseContracts.safeFactoryContract,
      this.baseContracts.safeSingletonContract,
      this.daoData as SafeMultisigDAO,
      this.saltNum,
      this.fallbackHandler,
      !!this.azoriusContracts,
    );

    this.predictedSafeAddress = predictedSafeAddress;
    this.createSafeTx = createSafeTx;

    this.setSafeContract(predictedSafeAddress);
  }

  public createDaoTxBuilder(
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: string,
  ): DaoTxBuilder {
    return new DaoTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.azoriusContracts,
      this.daoData,
      this.saltNum,
      this.createSafeTx!,
      this.safeContract!,
      this,
      this.parentAddress,
      this.parentTokenAddress,
      parentStrategyType,
      parentStrategyAddress,
    );
  }

  public createFreezeGuardTxBuilder(
    azoriusAddress?: string,
    strategyAddress?: string,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: string, // User only with ERC-721 parent
  ): FreezeGuardTxBuilder {
    return new FreezeGuardTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.daoData as SubDAO,
      this.safeContract!,
      this.saltNum,
      getAddress(this.parentAddress!),
      this.parentTokenAddress ? getAddress(this.parentTokenAddress) : undefined,
      this.azoriusContracts,
      azoriusAddress ? getAddress(azoriusAddress) : undefined,
      strategyAddress ? getAddress(strategyAddress) : undefined,
      parentStrategyType,
      parentStrategyAddress ? getAddress(parentStrategyAddress) : undefined,
    );
  }

  public createMultiSigTxBuilder(): MultisigTxBuilder {
    return new MultisigTxBuilder(
      this.baseContracts,
      this.daoData as SafeMultisigDAO,
      this.safeContract!,
    );
  }

  public async createAzoriusTxBuilder(): Promise<AzoriusTxBuilder> {
    const azoriusTxBuilder = new AzoriusTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.azoriusContracts!,
      this.daoData as AzoriusERC20DAO,
      this.safeContract!,
      this.votesERC20WrapperMasterCopyAddress,
      this.parentAddress ? getAddress(this.parentAddress) : undefined,
      this.parentTokenAddress ? getAddress(this.parentTokenAddress) : undefined,
    );

    await azoriusTxBuilder.init();
    return azoriusTxBuilder;
  }
}
