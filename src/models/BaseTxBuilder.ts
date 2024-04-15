import { Address, PublicClient, WalletClient } from 'viem';
import {
  BaseContracts,
  AzoriusContracts,
  SafeMultisigDAO,
  SubDAO,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
} from '../types';

export class BaseTxBuilder {
  protected readonly walletOrPublicClient: WalletClient | PublicClient;
  protected readonly baseContracts: BaseContracts;
  protected readonly azoriusContracts: AzoriusContracts | undefined;
  protected readonly daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO;
  protected readonly parentAddress?: Address;
  protected readonly parentTokenAddress?: Address;

  constructor(
    walletOrPublicClient: WalletClient | PublicClient,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts | undefined,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
    parentAddress?: Address,
    parentTokenAddress?: Address,
  ) {
    this.walletOrPublicClient = walletOrPublicClient;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.azoriusContracts = azoriusContracts;
    this.parentAddress = parentAddress;
    this.parentTokenAddress = parentTokenAddress;
  }
}
