import { createContext, useContext, Context } from 'react';
import {
  TokenDepositEvent,
  TokenWithdrawEvent,
  ERC20TokenEvent,
  ERC721TokenEvent,
  TreasuryAssetFungible,
  TreasuryAssetNonFungible,
} from '../../../providers/treasury/types';

export interface ITreasuryInjectorContext {
  transactions: (TokenDepositEvent | TokenWithdrawEvent | ERC20TokenEvent | ERC721TokenEvent)[];
  treasuryAssetsFungible: TreasuryAssetFungible[];
  treasuryAssetsNonFungible: TreasuryAssetNonFungible[];
}

export const TreasuryInjectorContext = createContext<ITreasuryInjectorContext | null>(null);

export const useTreasuryInjector = (): ITreasuryInjectorContext =>
  useContext(TreasuryInjectorContext as Context<ITreasuryInjectorContext>);
