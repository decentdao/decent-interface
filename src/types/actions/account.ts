import { IFavorites, IAudit } from '../account';

export enum AccountAction {
  UPDATE_DAO_FAVORITES,
  UPDATE_AUDIT_MESSAGE,
  RESET,
}

export type AccountActions =
  | { type: AccountAction.UPDATE_DAO_FAVORITES; payload: IFavorites }
  | { type: AccountAction.UPDATE_AUDIT_MESSAGE; payload: IAudit };
