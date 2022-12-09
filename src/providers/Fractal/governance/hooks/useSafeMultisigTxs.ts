import { SafeMultisigTransactionWithTransfersResponse } from '@gnosis.pm/safe-service-client';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { Dispatch, useEffect, useCallback } from 'react';
import { formatWeiToValue } from '../../../../utils';
import { DEFAULT_DATE_FORMAT } from '../../../../utils/numberFormats';
import { IGnosis } from '../../types';
import { totalsReducer } from '../../utils';
import { GovernanceAction, GovernanceActions } from '../actions';
import { IGovernance, TxProposalState, GovernanceTypes, ActivityEventType } from './../types';
interface IUseSafeMultisigTxs {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useSafeMultisigTxs = ({
  governance: { type },
  gnosis: {
    safeService,
    transactions,
    safe: { address },
  },
  governanceDispatch,
}: IUseSafeMultisigTxs) => {
  const getMultisigTx = useCallback(async () => {
    if (!safeService || !address || !type) {
      return;
    }
    if (!transactions.results.length) {
      return;
    }

    const multisigTxs = transactions.results
      .filter(tx => (tx as SafeMultisigTransactionWithTransfersResponse).safeTxHash)
      .map((transaction, _, transactionArr) => {
        const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;

        // @note for ethereum transactions event these are the execution date
        const eventDate = format(new Date(multiSigTransaction.submissionDate), DEFAULT_DATE_FORMAT);

        // returns mapping of Asset -> Asset Total Value by getting the total of each asset transfered
        const transferAmountTotalsMap = transaction.transfers.reduce(totalsReducer, new Map());

        // formats totals array into readable string with Symbol
        const transferAmountTotals = Array.from(transferAmountTotalsMap.values()).map(token => {
          const totalAmount = formatWeiToValue(token.bn, token.decimals);
          const symbol = token.symbol;
          return `${totalAmount} ${symbol}`;
        });
        const transferAddresses = transaction.transfers.map(transfer =>
          transfer.to.toLowerCase() === address!.toLowerCase() ? transfer.from : transfer.to
        );

        const isEthSend =
          !multiSigTransaction.data &&
          !multiSigTransaction.isExecuted &&
          !BigNumber.from(multiSigTransaction.value).isZero();

        if (isEthSend) {
          transferAmountTotals.push(`${formatWeiToValue(multiSigTransaction.value, 18)} ETHER`);
          transferAddresses.push(multiSigTransaction.to);
        }

        const mappedTxHashes = transaction.transfers.map(transfer => transfer.transactionHash);

        const txHashes = mappedTxHashes.length
          ? mappedTxHashes
          : [multiSigTransaction.transactionHash];

        const eventSafeTxHash = multiSigTransaction.safeTxHash;

        const eventNonce = multiSigTransaction.nonce;

        const noncePair = transactionArr.find(tx => {
          const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
          return (
            multiSigTx.nonce === eventNonce &&
            multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash
          );
        });

        const isMultisigRejectionTx =
          !multiSigTransaction.data &&
          multiSigTransaction.to === multiSigTransaction.safe &&
          noncePair &&
          BigNumber.from(multiSigTransaction.value).isZero();

        const isRejected = transactionArr.find(tx => {
          const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
          return (
            multiSigTx.nonce === eventNonce &&
            multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
            multiSigTx.isExecuted
          );
        });

        const isPending =
          multiSigTransaction.confirmations?.length !== multiSigTransaction.confirmationsRequired;

        const state = isRejected
          ? TxProposalState.Rejected
          : isPending
          ? TxProposalState.Pending
          : !multiSigTransaction.isExecuted
          ? TxProposalState.Active
          : multiSigTransaction.isSuccessful && multiSigTransaction.isExecuted
          ? TxProposalState.Executed
          : TxProposalState.Pending;

        return {
          state,
          eventType: ActivityEventType.Governance,
          eventDate, // update this
          proposalNumber: eventSafeTxHash,
          targets: [transaction.to],
          txHashes,
          multisigRejectedProposalNumber:
            isMultisigRejectionTx && !!noncePair
              ? (noncePair as SafeMultisigTransactionWithTransfersResponse).safeTxHash
              : undefined,
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
  }, [safeService, address, governanceDispatch, type, transactions]);

  useEffect(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE) {
      getMultisigTx();
    }
  }, [getMultisigTx, type]);
};
