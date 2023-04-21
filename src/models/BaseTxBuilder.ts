import { ethers } from 'ethers';
import { BaseContracts, AzoriusContracts, GnosisDAO, TokenGovernanceDAO, SubDAO } from '../types';

export class BaseTxBuilder {
  protected readonly signerOrProvider: ethers.Signer | any;
  protected readonly baseContracts: BaseContracts;
  protected readonly azoriusContracts: AzoriusContracts | undefined;
  protected readonly daoData: GnosisDAO | TokenGovernanceDAO | SubDAO;
  protected readonly parentAddress?: string;
  protected readonly parentTokenAddress?: string;

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    azoriusContracts: AzoriusContracts | undefined,
    daoData: GnosisDAO | TokenGovernanceDAO | SubDAO,
    parentAddress?: string,
    parentTokenAddress?: string
  ) {
    this.signerOrProvider = signerOrProvider;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.azoriusContracts = azoriusContracts;
    this.parentAddress = parentAddress;
    this.parentTokenAddress = parentTokenAddress;
  }
}
