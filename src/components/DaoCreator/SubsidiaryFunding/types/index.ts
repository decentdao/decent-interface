import {
  TreasuryAssetFungible,
  TreasuryAssetNonFungible,
} from '../../../../providers/treasury/types';

export type TokenToFund = {
  asset: TreasuryAssetFungible;
  amount: string;
};

export type NFTToFund = {
  asset: TreasuryAssetNonFungible;
};
