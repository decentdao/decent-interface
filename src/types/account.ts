import { BigNumber } from 'ethers';

export interface VotesTokenData extends VotesData, TokenData {}
export interface VotesData {
  balance: BigNumber | null;
  delegatee: string | null;
  votingWeight: BigNumber | null;
  isDelegatesSet: boolean | null;
}
export type UnderlyingTokenData = Omit<
  TokenData,
  'totalSupply' | 'decimals' | 'underlyingTokenData'
>;
export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  totalSupply: BigNumber;
  underlyingTokenData?: UnderlyingTokenData;
}
