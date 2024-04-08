import { BigNumber } from 'ethers';

export interface BigNumberValuePair {
  value: string;
  bigNumberValue?: BigNumber | null;
}

export type WithError = { error?: string };
