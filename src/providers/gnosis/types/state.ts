import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../treasury/types';

export interface Gnosis extends GnosisInformation, FungibleAssets, NonFungibleAssets {
  isLoading: boolean;
  safeAddress?: string;
  name?: string;
  isSigner: boolean;
}

export interface FungibleAssets {
  treasuryAssetsFungible: GnosisAssetFungible[];
}

export interface NonFungibleAssets {
  treasuryAssetsNonFungible: GnosisAssetNonFungible[];
}

export interface GnosisInformation {
  nonce?: number;
  threshold: number;
  owners: string[];
}
