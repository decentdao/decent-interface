import { ReactNode } from 'react';
import { BigIntValuePair } from './common';

export enum CreateProposalSteps {
  METADATA = 'metadata',
  TRANSACTIONS = 'transactions',
}

export interface CreateProposalTransaction<T = BigIntValuePair> {
  targetAddress: string;
  ethValue: T;
  functionName: string;
  parameters: {
    signature: string;
    label?: string;
    value?: string;
  }[];
}

export type CreateProposalMetadata = {
  title: string;
  description: string;
  documentationUrl?: string;
};

export enum ProposalBuilderMode {
  // @dev - this is temporary mode.
  // Probably will be removed in the future and actions are will be there by default.
  // UI / UX for this globally is in flux.
  PROPOSAL_WITH_ACTIONS = 'PROPOSAL_WITH_ACTIONS',
  PROPOSAL = 'PROPOSAL',
  TEMPLATE = 'TEMPLATE',
}
export type CreateProposalForm = {
  transactions: CreateProposalTransaction[];
  proposalMetadata: CreateProposalMetadata;
  nonce?: number;
};

export type ProposalTemplate = {
  transactions: CreateProposalTransaction[];
} & CreateProposalMetadata;

export enum ProposalActionType {
  ADD = 'add',
  EDIT = 'edit',
  DELETE = 'delete',
  TRANSFER = 'transfer',
}

export interface ProposalActionsStoreData {
  actions: CreateProposalAction[];
}

export interface ProposalActionsStore extends ProposalActionsStoreData {
  addAction: (action: CreateProposalAction) => void;
  removeAction: (actionIndex: number) => void;
  resetActions: () => void;
  getTransactions: () => CreateProposalTransaction[];
}

export type CreateProposalAction<T = BigIntValuePair> = {
  actionType: ProposalActionType;
  content: ReactNode;
  transactions: CreateProposalTransaction<T>[];
};
