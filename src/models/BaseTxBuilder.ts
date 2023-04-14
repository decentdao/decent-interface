import { ethers } from 'ethers';
import { BaseContracts, UsulContracts, GnosisDAO, TokenGovernanceDAO, SubDAO } from '../types';

export class BaseTxBuilder {
  protected readonly signerOrProvider: ethers.Signer | any;
  protected readonly baseContracts: BaseContracts;
  protected readonly usulContracts: UsulContracts | undefined;
  protected readonly daoData: GnosisDAO | TokenGovernanceDAO | SubDAO;
  protected readonly parentAddress?: string;
  protected readonly parentTokenAddress?: string;

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    usulContracts: UsulContracts | undefined,
    daoData: GnosisDAO | TokenGovernanceDAO | SubDAO,
    parentAddress?: string,
    parentTokenAddress?: string
  ) {
    this.signerOrProvider = signerOrProvider;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.usulContracts = usulContracts;
    this.parentAddress = parentAddress;
    this.parentTokenAddress = parentTokenAddress;
  }
}
