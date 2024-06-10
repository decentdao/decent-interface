import { TransferListResponse } from '@safe-global/api-kit';
import { Address } from 'viem';
import { ContractEvent } from './contract';
import { ActivityBase } from './fractal';
import { EthAddress } from './utils';

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
  amount: bigint;
}

export interface TokenWithdrawEvent extends TokenEvent {
  addresses: string[];
  amount: bigint;
}
export interface ERC721TokenEvent extends TokenEvent {
  contractAddresses: string[];
  tokenIds: bigint[];
}
export interface ERC20TokenEvent extends TokenEvent {
  contractAddresses: string[];
  addresses: string[];
  amounts: bigint[];
}

export type Transaction =
  | TokenDepositEvent
  | TokenWithdrawEvent
  | ERC20TokenEvent
  | ERC721TokenEvent;

export interface ITreasury {
  transactions: Transaction[];
  assetsFungible: TokenBalance[];
  assetsNonFungible: any[]; // @todo - type this
  transfers?: TransferListResponse;
  treasuryIsLoading: boolean;
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

export type TokenBalance = {
  tokenAddress: Address;
  balance: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
};

export type AssetTotals = {
  bi: bigint;
  symbol: string;
  decimals: number;
};

export enum TreasuryActivityTypes {
  DEPOSIT,
  WITHDRAW,
}

export interface TreasuryActivity extends ActivityBase {
  transferAddresses: string[];
  transferAmountTotals: string[];
  isDeposit: boolean;
}
