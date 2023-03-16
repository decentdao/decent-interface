import { Dispatch, SetStateAction } from 'react';
import { BigNumberValuePair } from './common';
import { ProposalExecuteData } from './daoProposal';

// export interface TransactionsAndSubmitProps {
//   show: boolean | undefined;
//   showBackButton: boolean;
//   onGoBack: () => void;
//   addTransaction: () => void;
//   pendingCreateTx: boolean;
//   submitProposal: ({
//     proposalData,
//     nonce,
//     pendingToastMessage,
//     failedToastMessage,
//     successToastMessage,
//     successCallback,
//   }: {
//     proposalData: ProposalExecuteData | undefined;
//     nonce: number | undefined;
//     pendingToastMessage: string;
//     failedToastMessage: string;
//     successToastMessage: string;
//     successCallback?: ((daoAddress: string) => void) | undefined;
//   }) => Promise<void>;
//   proposalData: ProposalExecuteData | undefined;
//   nonce: number | undefined;
//   successCallback: () => void;
//   isCreateDisabled: boolean;
//   transactions: TransactionData[];
//   setTransactions: Dispatch<SetStateAction<TransactionData[]>>;
//   removeTransaction: (transactionNumber: number) => void;
// }

export enum CreateProposalState {
  METADATA_FORM,
  TRANSACTIONS_FORM,
  LOADING,
}

export interface CreateProposalTransaction<T = BigNumberValuePair> {
  targetAddress: string;
  ethValue: T;
  functionName: string;
  functionSignature?: string;
  parameters?: string;
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
  nonce?: Number;
};
