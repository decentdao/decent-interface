import {
  EthereumTxWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@gnosis.pm/safe-service-client';
import { BadgeLabels } from './../components/ui/badges/Badge';

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
  transaction:
    | SafeModuleTransactionWithTransfersResponse
    | SafeMultisigTransactionWithTransfersResponse
    | EthereumTxWithTransfersResponse;
  transferAddresses: string[];
  transferAmountTotals: string[];
  isDeposit: boolean;
  eventDate: string;
  eventType: ActivityEventType;
  eventTxHash?: string;
  eventSafeTxHash?: string;
  eventTransactionsCount?: number;
  eventNonce?: number;
  eventState?: BadgeLabels;
};

export enum ActivityEventType {
  Treasury,
  Governance,
}

export enum GnosisTransferType {
  ERC721 = 'ERC721_TRANSFER',
  ERC20 = 'ERC20_TRANSFER',
  ETHER = 'ETHER_TRANSFER',
}
