import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { TxProposal } from '../../../providers/Fractal/types';

export default function ProposalTitle({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation('proposal');
  const targets = proposal?.metaData?.decodedTransactions.map(tx =>
    createAccountSubstring(tx.target)
  );
  return (
    <Text textStyle="text-xl-mono-bold">
      #{proposal.proposalNumber}{' '}
      {t('proposalTitle', {
        count: targets?.length,
        target: [...new Set(targets)].join(', '),
      })}
    </Text>
  );
}
