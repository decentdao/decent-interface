import { DAO, DAOAccessControl } from '@fractal-framework/core-contracts';
import { MVDAction } from '../constants/enums';

export interface MVDDAO {
  daoAddress?: string;
  daoContract?: DAO;
  daoName?: string;
  accessControlAddress?: string;
  accessControlContract?: DAOAccessControl;
  moduleAddresses?: string[];
  isLoading?: boolean;
}

export type MVDActions =
  | { type: MVDAction.SET_DAO; payload: MVDDAO }
  | {
      type: MVDAction.UPDATE_MODULE;
      payload: string[];
    }
  | { type: MVDAction.RESET }
  | { type: MVDAction.INVALID };
