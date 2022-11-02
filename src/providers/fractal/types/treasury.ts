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
  treasuryIsLoading: boolean;
}
