import { BigNumber } from 'ethers';

export interface IConnectedAccount {
  favorites: IFavorites;
  audit: IAudit;
}

export interface IAudit {
  hasAccepted?: boolean;
  acceptAuditWarning: () => void;
}

export interface IFavorites {
  favoritesList: string[];
  isConnectedFavorited: boolean;
  toggleFavorite: (key: string) => void;
}

export interface VotesTokenData extends VotesData, TokenData {}
export interface VotesData {
  balance: BigNumber | null;
  delegatee: string | null;
  votingWeight: BigNumber | null;
  isDelegatesSet: boolean | null;
}

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  totalSupply: BigNumber;
}
