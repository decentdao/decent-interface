import { BigNumberInput } from './../../provider/types/index';
import {
  TreasuryAssetFungible,
  TreasuryAssetNonFungible,
} from '../../../../providers/treasury/types';

export type TokenToFund = {
  asset: TreasuryAssetFungible;
  amount: BigNumberInput;
};

export type NFTToFund = {
  asset: TreasuryAssetNonFungible;
};
