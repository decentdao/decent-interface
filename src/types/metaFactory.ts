import { BigNumberish, Bytes } from 'ethers';
import { IDAOFactory } from '@fractal-framework/core-contracts';

export interface MetaFactoryCreateDAOData {
  daoFactory: string;
  createDAOParams: IDAOFactory.CreateDAOParamsStruct;
  targets: string[];
  values: BigNumberish[];
  calldatas: string[];
}
