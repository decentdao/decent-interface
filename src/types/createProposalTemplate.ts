import { BigNumberValuePair } from './common';

export enum CreateProposalTemplateFormState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
}

export interface CreateProposalTemplateTransaction<T = BigNumberValuePair> {
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
};

export interface ProposalTemplateTransactionParameter {
  id: string;
  signature: string;
  label: string;
  value: string;
}

export interface ProposalTemplateTransaction {
  id: string;
  targetAddress: string;
  ethValue?: string;
  functionName: string;
  parameters: ProposalTemplateTransactionParameter[];
}
export interface ProposalTemplate {
  id: string;
  title: string;
  description?: string;
  transactions: ProposalTemplateTransaction[];
}
