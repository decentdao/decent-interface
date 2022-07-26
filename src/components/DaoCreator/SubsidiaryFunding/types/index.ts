import {
  TreasuryAssetFungible,
  TreasuryAssetNonFungible,
} from '../../../../contexts/daoData/treasury/types';

export type TokenToFund = {
  asset: TreasuryAssetFungible;
  amount: string;
};

export type NFTToFund = {
  asset: TreasuryAssetNonFungible;
};
