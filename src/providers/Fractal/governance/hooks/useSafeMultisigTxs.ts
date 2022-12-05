import { format } from 'date-fns';
import { Dispatch, useEffect, useCallback } from 'react';
import { IGnosis } from '../../types';
import { GovernanceAction, GovernanceActions } from '../actions';
import { IGovernance, TxProposalState } from './../types';
interface IUseSafeMultisigTxs {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useSafeMultisigTxs = ({
  governance: { type },
  gnosis: {
    safeService,
    safe: { address },
  },
  governanceDispatch,
}: IUseSafeMultisigTxs) => {
  // const { eventTransactionMapping } = useActivityParser();

  const getMultisigTx = useCallback(async () => {
    if (!safeService || !address || !type) {
      return;
    }

    const multiSigTransactions = await safeService.getMultisigTransactions(address);
    if (!multiSigTransactions.results.length) {
      return;
    }

    const multisigTxs = multiSigTransactions.results.map((transaction, _, transactionArr) => {
      // mapping of each interacted contract address. this is used to calculate the number of transactions in a multisig transaction
      // const eventTransactionMap = eventTransactionMapping(transaction, true);

      // Used as the proposal id for multisig transactions
      const eventSafeTxHash = transaction.safeTxHash;

      // nonce of current event
      const eventNonce = transaction.nonce;

      // Check to see if a proposal has been successfully executed to reject current transaction
      const isRejected = transactionArr.find(tx => {
        return tx.nonce === eventNonce && tx.safeTxHash !== transaction.safeTxHash && tx.isExecuted;
      });

      const isPending = transaction.confirmations?.length !== transaction.confirmationsRequired;

      const eventState = isRejected
        ? TxProposalState.Rejected
        : isPending
        ? TxProposalState.Pending
        : !transaction.isExecuted
        ? TxProposalState.Active
        : transaction.isSuccessful && transaction.isExecuted
        ? TxProposalState.Executed
        : TxProposalState.Pending;

      const eventDate = format(new Date(transaction.submissionDate), 'MMM dd yyyy');

      return {
        state: eventState,
        submissionDate: eventDate, // update this
        proposalNumber: eventSafeTxHash,
        txHashes: [],
        // txHashes: Array.from(eventTransactionMap.values()).map((event: any) => event.to),
        decodedTransactions: [],
      };
    });

    const passedProposals = multisigTxs.reduce(
      (prev, proposal) => (proposal.state === TxProposalState.Executed ? prev + 1 : prev),
      0
    );

    const pendingProposals = multisigTxs.reduce(
      (prev, proposal) =>
        proposal.state === TxProposalState.Active || proposal.state === TxProposalState.Pending
          ? prev + 1
          : prev,
      0
    );

    governanceDispatch({
      type: GovernanceAction.UPDATE_PROPOSALS,
      payload: {
        txProposals: multisigTxs,
        passed: passedProposals,
        pending: pendingProposals,
      },
    });
  }, [safeService, address, governanceDispatch, type]);

  useEffect(() => {
    getMultisigTx();
  }, [getMultisigTx]);
};
