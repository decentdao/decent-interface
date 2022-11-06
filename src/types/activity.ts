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
  eventType: string;
  isDeposit: boolean;
};
