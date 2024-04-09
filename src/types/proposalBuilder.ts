import { BigNumberValuePair } from './common';

export enum CreateProposalState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
}
export interface CreateProposalTransaction<T = BigNumberValuePair> {
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
