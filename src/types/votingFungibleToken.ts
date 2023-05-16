import { BigNumber } from 'ethers';
import { ITokenAccount } from './fractal';

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
export type ClaimListener = (
  parentToken: string,
  childToken: string,
  claimer: string,
  amount: BigNumber,
  _: any
) => void;

export interface ITokenData {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  address: string | undefined;
  totalSupply: BigNumber | undefined;
}

export interface IGoveranceTokenData extends ITokenData, ITokenAccount, VotingTokenConfig {
  isLoading?: boolean;
}

export interface VotingTokenConfig<Type = BNFormattedPair> {
  votingPeriod?: Type;
  quorumPercentage?: Type;
  timeLockPeriod?: Type;
}

export interface BNFormattedPair {
  value: BigNumber;
  formatted?: string;
}

export type TokenAccountRaw = Omit<ITokenAccount, 'userBalanceString' | 'votingWeightString'>;
