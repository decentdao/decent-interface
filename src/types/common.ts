import { BigNumber } from 'ethers';

export interface BigNumberValuePair {
  value: string;
  bigNumberValue?: BigNumber;
}

export type WithError = { error?: string };
