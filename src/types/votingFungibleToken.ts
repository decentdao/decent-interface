import { ITokenAccount } from './fractal';

export type TransferListener = (from: string, to: string, value: bigint, _: any) => void;
export type DelegateChangedListener = (
  delegator: string,
  fromDelegate: string,
  toDelegate: string,
  _: any,
) => void;
export type DelegateVotesChangedListener = (
  delegate: string,
  previousBalance: bigint,
  currentBalance: bigint,
  _: any,
) => void;
export type ClaimListener = (
  parentToken: string,
  childToken: string,
  claimer: string,
  amount: bigint,
  _: any,
) => void;

export interface ITokenData {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  address: string | undefined;
  totalSupply: bigint | undefined;
}

export interface IGovernanceTokenData extends ITokenData, ITokenAccount, VotingTokenConfig {
  isLoading?: boolean;
}

export interface VotingTokenConfig<Type = BIFormattedPair> {
  votingPeriod?: Type;
  quorumPercentage?: Type;
  timeLockPeriod?: Type;
}

export interface BIFormattedPair {
  value: bigint;
  formatted?: string;
}

export type TokenAccountRaw = Omit<ITokenAccount, 'userBalanceString' | 'votingWeightString'>;
