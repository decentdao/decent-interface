import {
  EthereumTxWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@safe-global/safe-service-client';
import { TxProposalState } from './../providers/Fractal/governance/types';

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

export interface TreasuryActivity extends ActivityBase {
  transferAddresses: string[];
  transferAmountTotals: string[];
  isDeposit: boolean;
}

export interface GovernanceActivity extends ActivityBase {
  state?: TxProposalState;
  proposalNumber: string;
  eventTransactionsCount?: number;
}

export type Activity = TreasuryActivity | GovernanceActivity;

export type ActivityTransactionType =
  | SafeMultisigTransactionWithTransfersResponse
  | SafeModuleTransactionWithTransfersResponse
  | EthereumTxWithTransfersResponse;

export interface ActivityBase {
  eventDate: string;
  eventType: ActivityEventType;
  transaction?: ActivityTransactionType;
  transactionHash?: string | null;
}

export enum ActivityEventType {
  Treasury,
  Governance,
}

export enum GnosisTransferType {
  ERC721 = 'ERC721_TRANSFER',
  ERC20 = 'ERC20_TRANSFER',
  ETHER = 'ETHER_TRANSFER',
}
