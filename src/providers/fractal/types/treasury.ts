import {
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
  TransferListResponse,
  TransferResponse,
} from '@gnosis.pm/safe-service-client';
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

export interface ITreasury {
  transactions: Transaction[];
  assetsFungible: SafeBalanceUsdResponse[];
  assetsNonFungible: SafeCollectibleResponse[];
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

export interface TokenInfo {
  type: TokenType;
  address: string;
  name: string;
  symbol: string;
  logoUri: string;
  decimals: number;
}

export interface AssetTransfer extends TransferResponse {
  tokenInfo: TokenInfo;
}
