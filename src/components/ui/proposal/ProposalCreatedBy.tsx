import { Flex, Text } from '@chakra-ui/react';
import { Trans } from 'react-i18next';
import useDisplayName from '../../../hooks/useDisplayName';
import EtherscanLinkAddress from '../EtherscanLinkAddress';

function ProposalCreatedBy({ proposalProposer }: { proposalProposer: string }) {
  const { displayName: proposerDisplayName } = useDisplayName(proposalProposer);

  return (
    <Flex width="100%">
      <Trans
        i18nKey="proposedBy"
        ns="proposal"
        tOptions={{ proposer: proposerDisplayName }}
      >
        <Text>Proposed by </Text>
        <EtherscanLinkAddress address={proposalProposer}>
          <Text color="gold.500">{proposerDisplayName}</Text>
        </EtherscanLinkAddress>
      </Trans>
    </Flex>
  );
}

export default ProposalCreatedBy;
