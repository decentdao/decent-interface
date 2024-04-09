import { useCallback } from 'react';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { CreateProposalForm } from '../../../types/proposalBuilder';
import { encodeFunction } from '../../../utils/crypto';
import { couldBeENS, isValidUrl } from '../../../utils/url';

export function usePrepareProposal() {
  const signer = useEthersSigner();
  const prepareProposal = useCallback(
    async (values: CreateProposalForm) => {
      const { transactions, proposalMetadata } = values;
      const transactionsWithEncoding = transactions.map(tx => {
        const signature = tx.parameters.map(parameter => parameter.signature.trim()).join(', ');
        const parameters = tx.parameters
        .map(parameter =>
          isValidUrl(parameter.value!.trim())
            ? encodeURIComponent(parameter.value!.trim()) // If parameter.value is valid URL with special symbols like ":" or "?" - decoding might fail, thus we need to encode URL
            : parameter.value!.trim(),
        )
        .join(', ')

        return {
          ...tx,
          calldata: signature ? encodeFunction(
            tx.functionName,
            signature,
            parameters,
          ) : '0x',
        };
      });
      const targets = await Promise.all(
        transactionsWithEncoding.map(tx => {
          if (couldBeENS(tx.targetAddress)) {
            return signer!.resolveName(tx.targetAddress);
          }
          return tx.targetAddress;
        }),
      );

      return {
        targets,
        values: transactionsWithEncoding.map(transaction => transaction.ethValue.bigNumberValue!),
        calldatas: transactionsWithEncoding.map(
          transaction => transaction.calldata || '',
        ),
        metaData: {
          title: proposalMetadata.title,
          description: proposalMetadata.description,
          documentationUrl: proposalMetadata.documentationUrl,
        },
      };
    },
    [signer],
  );
  return { prepareProposal };
}
