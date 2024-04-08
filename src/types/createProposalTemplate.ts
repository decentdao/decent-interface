import { BigIntValuePair } from './common';

export enum CreateProposalTemplateFormState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
}

export interface CreateProposalTemplateTransaction<T = BigIntValuePair> {
  targetAddress: string;
  ethValue: T;
  functionName: string;
  parameters: {
    signature: string;
    label?: string;
    value?: string;
  }[];
}

export type CreateProposalTemplateMetadata = {
  title: string;
  description: string;
};

export type CreateProposalTemplateForm = {
  transactions: CreateProposalTemplateTransaction[];
  proposalTemplateMetadata: CreateProposalTemplateMetadata;
  nonce?: number;
};

export type ProposalTemplate = {
  transactions: CreateProposalTemplateTransaction[];
} & CreateProposalTemplateMetadata;
