import { BigNumber } from 'ethers';
import { EthAddress } from '.';

export type TokenAllocation = {
  isValidAddress: boolean;
  amount: BigNumber | undefined;
  addressError?: string;
} & EthAddress;
