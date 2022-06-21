import { BigNumberish } from 'ethers';
import { IDAOFactory } from '@fractal-framework/core-contracts';
import { IMetaFactory } from '../assets/typechain-types/metafactory';

export interface MetaFactoryCreateDAOData {
  daoFactory: string;
  metaFactoryTempRoleIndex: BigNumberish;
  createDAOParams: IDAOFactory.CreateDAOParamsStruct;
  moduleFactoriesCallData: IMetaFactory.ModuleFactoryCallDataStruct[];
  moduleActionData: IMetaFactory.ModuleActionDataStruct;
  roleModuleMembers: BigNumberish[][];
}
