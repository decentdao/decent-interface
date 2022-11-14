import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/useDisplayName';
import CopyToClipboard from '../CopyToClipboard';

function ProposalCreatedBy({
  proposalProposer,
  includeClipboard,
}: {
  proposalProposer: string;
  includeClipboard?: boolean;
}) {
  const { t } = useTranslation('proposal');
  const { displayName: proposerDisplayName } = useDisplayName(proposalProposer);

  return (
    <Flex width="100%">
      <Text>{t('createdBy', { proposer: proposerDisplayName })}</Text>
      {includeClipboard && <CopyToClipboard textToCopy={proposalProposer} />}
    </Flex>
  );
}

export default ProposalCreatedBy;
