import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../treasury/types';

export interface Gnosis extends GnosisInformation, GnosisAssets {
  isLoading: boolean;
  safeAddress?: string;
  name?: string;
  isSigner: boolean;
}

export interface GnosisAssets {
  treasuryAssetsFungible: GnosisAssetFungible[];
  treasuryAssetsNonFungible: GnosisAssetNonFungible[];
}

export interface GnosisInformation {
  nonce?: number;
  threshold: number;
  owners: string[];
}
