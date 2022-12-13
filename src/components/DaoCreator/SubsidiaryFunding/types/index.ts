import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { BigNumberInput } from './../../provider/types/index';

export type TokenToFund = {
  asset: SafeBalanceUsdResponse;
  amount: BigNumberInput;
};

export type NFTToFund = {
  asset: SafeCollectibleResponse;
};
