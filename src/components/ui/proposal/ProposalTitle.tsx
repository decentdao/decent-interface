import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { TxProposal } from '../../../providers/Fractal/types';

export default function ProposalTitle({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation('proposal');
  const targets = proposal?.metaData?.decodedTransactions.map(tx =>
    createAccountSubstring(tx.target)
  );
  const proposalNumber =
    proposal.proposalNumber.length > 8
      ? createAccountSubstring(proposal.proposalNumber)
      : proposal.proposalNumber;
  return (
    <Text textStyle="text-lg-mono-bold">
      #{proposalNumber}{' '}
      {t('proposalTitle', {
        count: proposal.txHashes.length,
        target: [...new Set(targets)].join(', '),
      })}
    </Text>
  );
}
