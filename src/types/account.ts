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

export interface VotesTokenData {
  name: string;
  balance: BigNumber;
  delegatee: string;
  votingWeight: BigNumber; // there was a string version of this, look into why this isn't just parsed in component
  symbol: string;
  decimals: number;
  address: string;
  totalSupply: BigNumber;
}
