import { DAO, DAOAccessControl } from '@fractal-framework/core-contracts';
import { FractalAction } from '../constants/enums';

export interface FractalDAO {
  daoAddress?: string;
  daoContract?: DAO;
  daoName?: string;
  accessControlAddress?: string;
  accessControlContract?: DAOAccessControl;
  moduleAddresses?: string[];
  isLoading?: boolean;
}

export type FractalActions =
  | { type: FractalAction.SET_DAO; payload: FractalDAO }
  | {
      type: FractalAction.UPDATE_MODULE;
      payload: string[];
    }
  | { type: FractalAction.RESET }
  | { type: FractalAction.INVALID };
