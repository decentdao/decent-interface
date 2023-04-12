import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DisplayAddress } from '../links/DisplayAddress';

function ProposalCreatedBy({ proposalProposer }: { proposalProposer: string }) {
  const { t } = useTranslation('proposal');
  return (
    <Flex
      width="100%"
      gap={2}
    >
      <Text>{t('proposedBy')}</Text>
      <DisplayAddress address={proposalProposer} />
    </Flex>
  );
}

export default ProposalCreatedBy;
