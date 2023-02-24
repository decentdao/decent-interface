import { ExecuteData } from './execute';
import { TransactionData } from './transaction';

export interface ProposalExecuteData extends ExecuteData {
  title: string;
  description: string;
  documentationUrl: string;
}

export type ProposalFormState = {
  proposalDescription: string;
  transactions: TransactionData[];
  proposalData?: {
    title: string;
    description: string;
    documentationUrl: string;
  };
  nonce: Number | undefined;
};
