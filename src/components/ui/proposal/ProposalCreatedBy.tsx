import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from '../EtherscanLinkAddress';

function ProposalCreatedBy({ proposalProposer }: { proposalProposer: string }) {
  const { t } = useTranslation('proposal');
  const { displayName: proposerDisplayName } = useDisplayName(proposalProposer);

  return (
    <Flex
      width="100%"
      gap={2}
    >
      <Text>{t('proposedBy')}</Text>
      <EtherscanLinkAddress address={proposalProposer}>
        <Text color="gold.500">{proposerDisplayName}</Text>
      </EtherscanLinkAddress>
    </Flex>
  );
}

export default ProposalCreatedBy;
