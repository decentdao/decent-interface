import { BigNumber } from 'ethers';
import { EthAddress } from '../../../types';
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

export interface TokenDepositEvent extends TokenEvent, EthAddress {
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

export type Transaction =
  | TokenDepositEvent
  | TokenWithdrawEvent
  | ERC20TokenEvent
  | ERC721TokenEvent;

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
export interface GnosisAssetNonFungible extends EthAddress {
  tokenName: string;
  tokenSymbol: string;
  logoUri: string;
  id: string;
  uri: string;
  name: string;
  description: string;
  imageUri: string;
}

export interface ITreasury {
  transactions: Transaction[];
  assetsFungible: GnosisAssetFungible[];
  assetsNonFungible: GnosisAssetNonFungible[];
  transfers: AssetTransfer[];
  treasuryIsLoading: boolean;
}

export interface AssetTransfers {
  count: number;
  // next: undefined; TODO pagination...
  // previous: undefined;
  results: AssetTransfer[];
}

export enum TransferType {
  ETHER_TRANSFER = 'ETHER_TRANSFER',
  ERC20_TRANSFER = 'ERC20_TRANSFER',
  ERC721_TRANSFER = 'ERC721_TRANSFER',
}

export enum TokenType {
  ERC20,
  ERC721,
}

export interface TokenInfo {
  type: TokenType;
  address: string;
  name: string;
  symbol: string;
  logoUri: string;
  decimals: number;
}

export interface AssetTransfer {
  type: TransferType;
  executionDate: string; // todo Date?
  blockNumber: BigNumber;
  transactionHash: string;
  to: string;
  from: string;

  // ETHER_TRANSFER and ERC20_TRANSFER
  value: BigNumber;

  // ERC20_TRANSFER and ERC721_TRANSFER
  tokenAddress: string;
  tokenInfo: TokenInfo;

  // ERC721_TRANSFER
  tokenId: string;
}
