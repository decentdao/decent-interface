import { Box, Flex } from '@chakra-ui/react';
import { useFractal } from '../../providers/App/AppProvider';
import NoDataCard from '../ui/containers/NoDataCard';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalTemplateCard from './ProposalTemplateCard';

export default function ProposalTemplates() {
  const {
    governance: { proposalTemplates },
  } = useFractal();

  return (
    <Flex
      flexDirection={proposalTemplates && proposalTemplates.length > 0 ? 'row' : 'column'}
      flexWrap="wrap"
      gap="1rem"
    >
      {!proposalTemplates ? (
        <Box>
          <InfoBoxLoader />
        </Box>
      ) : proposalTemplates.length > 0 ? (
        proposalTemplates.map((proposalTemplate, i) => (
          <ProposalTemplateCard
            key={i}
            proposalTemplate={proposalTemplate}
            templateIndex={i}
          />
        ))
      ) : (
        <NoDataCard
          translationNameSpace="proposalTemplate"
          emptyText="emptyProposalTemplates"
          emptyTextNotProposer="empyProposalTemplatesNotProposer"
        />
      )}
    </Flex>
  );
}
