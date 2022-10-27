import { createContext, useContext, Context } from 'react';
import {
  TokenDepositEvent,
  TokenWithdrawEvent,
  ERC20TokenEvent,
  ERC721TokenEvent,
  GnosisAssetFungible,
  GnosisAssetNonFungible,
} from '../../../providers/treasury/types';

export type Transaction =
  | TokenDepositEvent
  | TokenWithdrawEvent
  | ERC20TokenEvent
  | ERC721TokenEvent;

export interface IGnosisTreasuryInjectorContext {
  transactions: Transaction[];
  gnosisAssetsFungible: GnosisAssetFungible[];
  gnosisAssetsNonFungible: GnosisAssetNonFungible[];
}

export const GnosisTreasuryInjectorContext = createContext<IGnosisTreasuryInjectorContext | null>(
  null
);

export const useGnosisTreasuryInjector = (): IGnosisTreasuryInjectorContext =>
  useContext(GnosisTreasuryInjectorContext as Context<IGnosisTreasuryInjectorContext>);
