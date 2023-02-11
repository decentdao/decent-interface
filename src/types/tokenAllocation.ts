import { BigNumber } from 'ethers';
import { EthAddress } from '.';

export type TokenAllocation<T = BigNumber> = {
  amount: T;
} & EthAddress;
