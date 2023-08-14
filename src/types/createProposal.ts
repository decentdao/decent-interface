import { BigNumberValuePair } from './common';

export enum CreateProposalState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
}

export interface CreateProposalTransaction<T = BigNumberValuePair> {
  targetAddress: string;
  ethValue: T;
  functionName: string;
  functionSignature: string;
  parameters: string;
  encodedFunctionData?: string;
}

export type ProposalMetadata = {
  title: string;
  description: string;
  documentationUrl: string;
};

export type CreateProposalForm = {
  transactions: CreateProposalTransaction[];
  proposalMetadata: ProposalMetadata;
  nonce?: number;
};
