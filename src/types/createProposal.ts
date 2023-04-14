import { BigNumberValuePair } from './common';

export enum CreateProposalState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
  LOADING,
}

export interface CreateProposalTransaction<T = BigNumberValuePair> {
  targetAddress: string;
  ethValue: T;
  functionName: string;
  functionSignature: string;
  parameters: string;
  encodedFunctionData?: string;
}

export type CreateProposalMetadata = {
  title: string;
  description: string;
  documentationUrl: string;
};

export type CreateProposalForm = {
  transactions: CreateProposalTransaction[];
  proposalMetadata: CreateProposalMetadata;
  nonce: number;
};
