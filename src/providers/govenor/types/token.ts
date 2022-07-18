import { BigNumber } from 'ethers';

export type TransferListener = (from: string, to: string, value: BigNumber, _: any) => void;
export type DelegateChangedListener = (
  delegator: string,
  fromDelegate: string,
  toDelegate: string,
  _: any
) => void;
export type DelegateVotesChangedListener = (
  delegate: string,
  previousBalance: BigNumber,
  currentBalance: BigNumber,
  _: any
) => void;
