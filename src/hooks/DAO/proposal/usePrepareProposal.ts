import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { CreateProposalForm } from '../../../types/proposalBuilder';
import { encodeFunction } from '../../../utils/crypto';
import { couldBeENS, isValidUrl } from '../../../utils/url';

export function usePrepareProposal() {
  const publicClient = usePublicClient();
  const prepareProposal = useCallback(
    async (values: CreateProposalForm) => {
      const { transactions, proposalMetadata } = values;
      const transactionsWithEncoding = transactions.map(tx => {
        if (!tx.functionName) {
          return {
            ...tx,
            calldata: '0x',
          };
        } else {
          const signature = tx.parameters.map(parameter => parameter.signature.trim()).join(', ');
          const parameters = tx.parameters
            .map(parameter =>
              isValidUrl(parameter.value!.trim())
                ? encodeURIComponent(parameter.value!.trim()) // If parameter.value is valid URL with special symbols like ":" or "?" - decoding might fail, thus we need to encode URL
                : parameter.value!.trim(),
            )
            .join(', ');

          return {
            ...tx,
            calldata: encodeFunction(tx.functionName, signature, parameters),
          };
        }
      });
      const targets = await Promise.all(
        transactionsWithEncoding.map(tx => {
          if (couldBeENS(tx.targetAddress) && publicClient) {
            return publicClient!.getEnsAddress({ name: tx.targetAddress });
          }
          return tx.targetAddress;
        }),
      );

      return {
        targets,
        values: transactionsWithEncoding.map(transaction => transaction.ethValue.bigintValue || 0n),
        calldatas: transactionsWithEncoding.map(transaction => transaction.calldata || ''),
        metaData: {
          title: proposalMetadata.title,
          description: proposalMetadata.description,
          documentationUrl: proposalMetadata.documentationUrl,
        },
      };
    },
    [publicClient],
  );
  return { prepareProposal };
}
