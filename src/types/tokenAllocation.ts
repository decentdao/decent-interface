import { BigNumber } from 'ethers';

export type TokenAllocation = {
  address: string;
  amount: BigNumber;
  addressError?: string;
};
