import { Box, Flex } from '@chakra-ui/react';
import { CONTENT_MAXW } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalProposal } from '../../types';
import NoDataCard from '../ui/containers/NoDataCard';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalCard from './ProposalCard/ProposalCard';

interface ProposalsListProps {
  proposals: FractalProposal[];
}

export function ProposalsList({ proposals }: ProposalsListProps) {
  const {
    governance: { type, loadingProposals, allProposalsLoaded },
  } = useFractal();

  return (
    <Flex
      flexDirection="column"
      gap="1rem"
      maxW={CONTENT_MAXW}
    >
      {!type || loadingProposals ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : proposals.length > 0 ? (
        <>
          {proposals.map(proposal => (
            <ProposalCard
              key={proposal.proposalId}
              proposal={proposal}
            />
          ))}
          {!allProposalsLoaded && <InfoBoxLoader />}
        </>
      ) : (
        <NoDataCard
          emptyText="emptyProposals"
          emptyTextNotProposer="emptyProposalsNotProposer"
          translationNameSpace="proposal"
        />
      )}
    </Flex>
  );
}
