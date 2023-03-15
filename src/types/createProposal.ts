import { Dispatch, SetStateAction } from 'react';
import { ProposalExecuteData } from './daoProposal';
import { TransactionData } from './transaction';

export interface TransactionsAndSubmitProps {
  show: boolean | undefined;
  showBackButton: boolean;
  onGoBack: () => void;
  addTransaction: () => void;
  pendingCreateTx: boolean;
  submitProposal: ({
    proposalData,
    nonce,
    pendingToastMessage,
    failedToastMessage,
    successToastMessage,
    successCallback,
  }: {
    proposalData: ProposalExecuteData | undefined;
    nonce: number | undefined;
    pendingToastMessage: string;
    failedToastMessage: string;
    successToastMessage: string;
    successCallback?: ((daoAddress: string) => void) | undefined;
  }) => Promise<void>;
  proposalData: ProposalExecuteData | undefined;
  nonce: number | undefined;
  successCallback: () => void;
  isCreateDisabled: boolean;
  transactions: TransactionData[];
  setTransactions: Dispatch<SetStateAction<TransactionData[]>>;
  removeTransaction: (transactionNumber: number) => void;
}
