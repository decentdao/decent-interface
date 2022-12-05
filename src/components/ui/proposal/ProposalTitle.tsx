import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { TxProposal } from '../../../providers/Fractal/types';

export default function ProposalTitle({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation('proposal');
  const targets = proposal.decodedTransactions.map(tx => createAccountSubstring(tx.target));
  return (
    <Text textStyle="text-xl-mono-bold">
      #{proposal.proposalNumber.toString()}{' '}
      {t('proposalTitle', {
        count: proposal.txHashes.length,
        target: [...new Set(targets)].join(', '),
      })}
    </Text>
  );
}
