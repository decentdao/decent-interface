import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../../../providers/fractal/types';
import { BigNumberInput } from './../../provider/types/index';

export type TokenToFund = {
  asset: GnosisAssetFungible;
  amount: BigNumberInput;
};

export type NFTToFund = {
  asset: GnosisAssetNonFungible;
};
