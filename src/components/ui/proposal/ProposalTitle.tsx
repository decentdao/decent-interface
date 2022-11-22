import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../../hooks/useDisplayName';
import { Proposal } from '../../../providers/fractal/types';

export default function ProposalTitle({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation('proposal');
  const targets = proposal.decodedTransactions.map(tx => createAccountSubstring(tx.target));
  return (
    <Text textStyle="text-xl-mono-bold">
      {t('proposalTitle', {
        count: proposal.txHashes.length,
        target: [...new Set(targets)].join(', '),
      })}
    </Text>
  );
}
