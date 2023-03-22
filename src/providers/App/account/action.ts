import { BigNumber } from 'ethers';
import { VotesTokenData } from '../../../types';

export enum AccountAction {
  SET_FAVORITES,
  UPDATE_FAVORITE,
  SET_VOTES_TOKEN,
  UPDATE_TOKEN_BALANCE,
  UPDATE_TOKEN_VOTING_WEIGHT,
  UPDATE_VOTING_DELEGATEE,
  RESET,
}

export type AccountActions =
  | { type: AccountAction.SET_FAVORITES; payload: string[] }
  | { type: AccountAction.UPDATE_FAVORITE; payload: string }
  | { type: AccountAction.SET_VOTES_TOKEN; payload: VotesTokenData }
  | { type: AccountAction.UPDATE_TOKEN_BALANCE; payload: BigNumber }
  | { type: AccountAction.UPDATE_TOKEN_VOTING_WEIGHT; payload: BigNumber }
  | { type: AccountAction.UPDATE_VOTING_DELEGATEE; payload: string }
  | { type: AccountAction.RESET };
