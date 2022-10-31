import { BigNumber } from 'ethers';
import { ContractEvent } from '../../../types/contract';

export enum TokenEventType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export interface TokenEvent extends ContractEvent {
  transactionHash: string;
  blockNumber: number;
  eventType: TokenEventType;
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
  addresses: string[];
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
export interface GnosisAssetFungible {
  balance: string;
  ethValue: string;
  fiatBalance: string;
  fiatCode: string;
  fiatConversion: string;
  timestamp: string;
  token: { decimals: number; logoUri: string; name: string; symbol: string };
  tokenAddress: string;
}
export interface GnosisAssetNonFungible {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  logoUri: string;
  id: string;
  uri: string;
  name: string;
  description: string;
  imageUri: string;
}

export interface TreasuryAssetFungibleFiatAmount {
  [currencyId: string]: {
    amount: number;
    currency: string;
    formattedAmount: string;
  };
}

export interface TreasuryAssetsFungibleFiatAmounts {
  [address: string]: TreasuryAssetFungibleFiatAmount;
}

export interface TreasuryAssetFungiblePrice extends TreasuryAssetFungibleFiatAmount {}
export interface TreasuryAssetsFungiblePrices extends TreasuryAssetsFungibleFiatAmounts {}

export interface TreasuryAssetNonFungible {
  name: string;
  symbol: string;
  tokenId: BigNumber;
  contractAddress: string;
  tokenURI: string;
}
