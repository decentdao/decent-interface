import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { BigNumberValuePair } from '../../../ui/forms/BigNumberInput';

export type TokenToFund = {
  asset: SafeBalanceUsdResponse;
  amount: BigNumberValuePair;
};

export type NFTToFund = {
  asset: SafeCollectibleResponse;
};
