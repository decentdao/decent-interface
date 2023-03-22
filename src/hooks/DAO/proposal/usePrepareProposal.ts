import { useCallback } from 'react';
import { CreateProposalForm } from '../../../types';
import { encodeFunction } from '../../../utils/crypto';

export function usePrepareProposal() {
  const prepareProposal = useCallback((values: CreateProposalForm) => {
    const { transactions, proposalMetadata } = values;
    const transactionsWithEncoding = transactions.map(tx => {
      return {
        ...tx,
        encodedFunctionData: encodeFunction(tx.functionName, tx.functionSignature, tx.parameters),
      };
    });
    return {
      targets: transactionsWithEncoding.map(transaction => transaction.targetAddress),
      values: transactionsWithEncoding.map(transaction => transaction.ethValue.bigNumberValue!),
      calldatas: transactionsWithEncoding.map(transaction => transaction.encodedFunctionData || ''),
      title: proposalMetadata.title,
      description: proposalMetadata.description,
      documentationUrl: proposalMetadata.documentationUrl,
    };
  }, []);
  return { prepareProposal };
}
