import { createContext, useContext, Context } from 'react';
import { TreasuryModule } from '../../../assets/typechain-types/module-treasury';
import { TreasuryAssetFungible, TreasuryAssetNonFungible } from '../types';

export interface ITreasuryContext {
  treasuryModuleContract: TreasuryModule | undefined;
  treasuryAssetsFungible: TreasuryAssetFungible[];
  treasuryAssetsNonFungible: TreasuryAssetNonFungible[];
}

export const TreasuryContext = createContext<ITreasuryContext | null>(null);

export const useTreasuryModule = (): ITreasuryContext =>
  useContext(TreasuryContext as Context<ITreasuryContext>);
