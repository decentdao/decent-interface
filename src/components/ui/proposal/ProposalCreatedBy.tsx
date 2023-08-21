import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DisplayAddress } from '../links/DisplayAddress';

function ProposalCreatedBy({ proposer }: { proposer: string }) {
  const { t } = useTranslation('proposal');
  return (
    <Flex
      width="100%"
      gap={2}
    >
      <Text>{t('proposedBy')}</Text>
      <DisplayAddress address={proposer} />
    </Flex>
  );
}

export default ProposalCreatedBy;
