import { ethers } from 'ethers';
import { PublicClient } from 'viem';
import {
  BaseContracts,
  AzoriusContracts,
  SafeMultisigDAO,
  SubDAO,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
} from '../types';

export class BaseTxBuilder {
  protected readonly signerOrProvider: ethers.Signer | any;
  protected readonly publicClient: PublicClient;
  protected readonly baseContracts: BaseContracts;
  protected readonly azoriusContracts: AzoriusContracts | undefined;
  protected readonly daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO;
  protected readonly parentAddress?: string;
  protected readonly parentTokenAddress?: string;

  constructor(
    signerOrProvider: ethers.Signer | any,
    publicClient: PublicClient,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts | undefined,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
    parentAddress?: string,
    parentTokenAddress?: string,
  ) {
    this.signerOrProvider = signerOrProvider;
    this.publicClient = publicClient;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.azoriusContracts = azoriusContracts;
    this.parentAddress = parentAddress;
    this.parentTokenAddress = parentTokenAddress;
  }
}
