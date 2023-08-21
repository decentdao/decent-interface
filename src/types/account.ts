import { BigNumber } from 'ethers';

export interface VotesTokenData extends VotesData, ERC20TokenData {}
export interface VotesData {
  balance: BigNumber | null;
  delegatee: string | null;
  votingWeight: BigNumber | null;
  isDelegatesSet: boolean | null;
}
export type UnderlyingTokenData = Omit<
  ERC20TokenData,
  'totalSupply' | 'decimals' | 'underlyingTokenData'
>;

export interface BaseTokenData {
  name: string;
  symbol: string;
  address: string;
}
export interface ERC20TokenData extends BaseTokenData {
  decimals: number;
  totalSupply: BigNumber;
  underlyingTokenData?: UnderlyingTokenData;
}

export interface ERC721TokenData extends BaseTokenData {
  totalSupply?: BigNumber;
  votingWeight: BigNumber;
}
