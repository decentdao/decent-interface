import { BigNumberValuePair } from './common';

export enum CreateIntegrationState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
  LOADING,
}

export interface CreateIntegrationTransaction<T = BigNumberValuePair> {
  targetAddress: string;
  ethValue: T;
  functionName: string;
  functionSignature: string;
  parameters: string;
  encodedFunctionData?: string;
}

export type CreateIntegrationMetadata = {
  title: string;
  description: string;
};

export type CreateIntegrationForm = {
  transactions: CreateIntegrationTransaction[];
  integrationMetadata: CreateIntegrationMetadata;
};
