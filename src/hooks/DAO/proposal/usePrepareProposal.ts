import { useCallback } from 'react';
import { useSigner } from 'wagmi';
import { CreateProposalForm } from '../../../types';
import { encodeFunction } from '../../../utils/crypto';
import { couldBeENS } from '../../../utils/url';

export function usePrepareProposal() {
  const { data: signer } = useSigner();
  const prepareProposal = useCallback(
    async (values: CreateProposalForm) => {
      const { transactions, proposalMetadata } = values;
      const transactionsWithEncoding = transactions.map(tx => {
        return {
          ...tx,
          encodedFunctionData: encodeFunction(tx.functionName, tx.functionSignature, tx.parameters),
        };
      });
      const targets = await Promise.all(
        transactionsWithEncoding.map(tx => {
          if (couldBeENS(tx.targetAddress)) {
            return signer!.resolveName(tx.targetAddress);
          }
          return tx.targetAddress;
        })
      );
      return {
        targets,
        values: transactionsWithEncoding.map(transaction => transaction.ethValue.bigNumberValue!),
        calldatas: transactionsWithEncoding.map(
          transaction => transaction.encodedFunctionData || ''
        ),
        metaData: {
          title: proposalMetadata.title,
          description: proposalMetadata.description,
          documentationUrl: proposalMetadata.documentationUrl,
        },
      };
    },
    [signer]
  );
  return { prepareProposal };
}
