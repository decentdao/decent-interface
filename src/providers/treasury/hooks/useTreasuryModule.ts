import { createContext, useContext, Context } from 'react';
import { TreasuryModule } from '../../../assets/typechain-types/module-treasury';
import {
  TreasuryAssetFungible,
  TreasuryAssetsFungibleFiatAmounts,
  TreasuryAssetsFungiblePrices,
  TreasuryAssetNonFungible,
} from '../types';

export interface ITreasuryContext {
  selectedCurrency: string;
  treasuryModuleContract: TreasuryModule | undefined;
  treasuryAssetsFungible: TreasuryAssetFungible[];
  treasuryAssetsFungibleFiatAmounts: TreasuryAssetsFungibleFiatAmounts;
  treasuryAssetsFungiblePrices: TreasuryAssetsFungiblePrices;
  treasuryAssetsNonFungible: TreasuryAssetNonFungible[];
}

export const TreasuryContext = createContext<ITreasuryContext | null>(null);

export const useTreasuryModule = (): ITreasuryContext =>
  useContext(TreasuryContext as Context<ITreasuryContext>);
