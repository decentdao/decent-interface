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
  SafeL2,
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
  public predictedSafeAddress: Address | undefined;
  public createSafeTx: SafeTransaction | undefined;
  private safeContract: SafeL2 | undefined;
  public fallbackHandler: Address;

  constructor(
    walletOrPublicClient: WalletClient | PublicClient | any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts | undefined,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
    fallbackHandler: Address,
    parentAddress?: Address,
    parentTokenAddress?: Address,
  ) {
    super(
      walletOrPublicClient,
      baseContracts,
      azoriusContracts,
      daoData,
      parentAddress,
      parentTokenAddress,
    );

    this.fallbackHandler = fallbackHandler;
    this.saltNum = BigInt(getRandomBytes());
  }

  public setSafeContract(safeAddress: Address) {
    const safeContract = getContract({
      address: safeAddress,
      client: this.walletOrPublicClient,
      abi: this.baseContracts.safeSingletonContract.abi,
    });
    this.safeContract = safeContract as unknown as SafeL2;
  }

  public async setupSafeData(): Promise<void> {
    const { predictedSafeAddress, createSafeTx } = await safeData(
      this.walletOrPublicClient,
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
    parentStrategyAddress?: Address,
  ): DaoTxBuilder {
    return new DaoTxBuilder(
      this.walletOrPublicClient,
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
    azoriusAddress?: Address,
    strategyAddress?: Address,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: Address, // User only with ERC-721 parent
  ): FreezeGuardTxBuilder {
    return new FreezeGuardTxBuilder(
      this.walletOrPublicClient,
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
      this.walletOrPublicClient,
      this.baseContracts,
      this.azoriusContracts!,
      this.daoData as AzoriusERC20DAO,
      this.safeContract!,
      this.parentAddress ? getAddress(this.parentAddress) : undefined,
      this.parentTokenAddress ? getAddress(this.parentTokenAddress) : undefined,
    );

    await azoriusTxBuilder.init();
    return azoriusTxBuilder;
  }
}
