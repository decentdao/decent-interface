import { BigNumber } from 'ethers';
import { CoinGeckoApiResponse } from './coingecko';

export interface TokenEvent {
  transactionHash: string;
  blockNumber: number;
}

export interface TokenDepositEvent extends TokenEvent {
  address: string;
  amount: BigNumber;
}

export interface TokenWithdrawEvent extends TokenEvent {
  addresses: string[];
  amount: BigNumber;
}
export interface ERC721TokenEvent extends TokenEvent {
  contractAddresses: string[];
  tokenIds: BigNumber[];
}
export interface ERC20TokenEvent extends TokenEvent {
  contractAddresses: string[];
  amounts: BigNumber[];
}

export interface TreasuryAssetFungible {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  totalAmount: BigNumber;
  formattedTotal: string;
}

export interface TreasuryAssetFungibleFiatAmount {
  [currency: string]: {
    amount: number;
    currency: string;
    formattedAmount: string;
  };
}

export interface TreasuryAssetFungibleFiatAmounts {
  [address: string]: TreasuryAssetFungibleFiatAmount;
};

export interface TreasuryAssetFungiblePrice extends TreasuryAssetFungibleFiatAmount {};
export interface TreasuryAssetFungiblePrices extends TreasuryAssetFungibleFiatAmounts {};

export interface TreasuryAssetNonFungible {
  name: string;
  symbol: string;
  tokenId: BigNumber;
  contractAddress: string;
  tokenURI: string;
}
