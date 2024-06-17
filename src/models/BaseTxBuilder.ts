import { PublicClient } from 'viem';
import { SafeMultisigDAO, SubDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../types';

export class BaseTxBuilder {
  protected readonly publicClient: PublicClient;
  protected readonly isAzorius: boolean;
  protected readonly daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO;
  protected readonly parentAddress?: string;
  protected readonly parentTokenAddress?: string;

  constructor(
    publicClient: PublicClient,
    isAzorius: boolean,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
    parentAddress?: string,
    parentTokenAddress?: string,
  ) {
    this.publicClient = publicClient;
    this.daoData = daoData;
    this.isAzorius = isAzorius;
    this.parentAddress = parentAddress;
    this.parentTokenAddress = parentTokenAddress;
  }
}
