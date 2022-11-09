import { EthereumTxWithTransfers } from '../providers/fractal/types';

export enum ActivityFilters {
  All,
  Pending,
  Active,
  Rejected,
}

export enum TreasuryActivityTypes {
  DEPOSIT,
  WITHDRAW,
}

export type Activity = {
  transaction: EthereumTxWithTransfers;
  transferAddresses: string[];
  transferAmountTotals: string[];
  eventDate: string;
  eventType: ActivityEventType;
  isDeposit: boolean;
};

export enum ActivityEventType {
  Treasury,
}

export enum GnosisTransferType {
  ERC721 = 'ERC721_TRANSFER',
  ERC20 = 'ERC20_TRANSFER',
  ETHER = 'ETHER_TRANSFER',
}
