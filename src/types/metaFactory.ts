import { BigNumberish } from 'ethers';
import { IDAOFactory } from '@fractal-framework/core-contracts';

export interface MetaFactoryCreateDAOData {
  daoFactory: string;
  createDAOParams: IDAOFactory.CreateDAOParamsStruct;
  moduleFactories: string[];
  moduleFactoriesBytes: string[][];
  targets: string[];
  values: BigNumberish[];
  calldatas: string[];
}
