import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { SortBy } from '../../../../types';
import ProposalCard from '../../../Proposals/ProposalCard/ProposalCard';
import NoDataCard from '../../../ui/containers/NoDataCard';
import { InfoBoxLoader } from '../../../ui/loaders/InfoBoxLoader';
import { Sort } from '../../../ui/utils/Sort';
import { ActivityFreeze } from './ActivityFreeze';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const {
    guardContracts: { freezeVotingContractAddress },
    guard,
    governance: { type, loadingProposals, allProposalsLoaded },
  } = useFractal();
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const { sortedActivities } = useActivities(sortBy);

  return (
    <Box>
      <Flex
        justifyContent="flex-start"
        alignItems="center"
        mx="0.5rem"
        my="1rem"
      >
        <Sort
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Flex>
      <Flex
        flexDirection="column"
        gap="1rem"
      >
        {freezeVotingContractAddress &&
          guard.freezeProposalVoteCount !== null &&
          guard.freezeProposalVoteCount > 0n && <ActivityFreeze />}
        {!type || loadingProposals ? (
          <InfoBoxLoader />
        ) : sortedActivities.length ? (
          <Flex
            flexDirection="column"
            gap="1rem"
          >
            {sortedActivities.map((activity, i) => (
              <ProposalCard
                key={i}
                proposal={activity}
              />
            ))}
            {!allProposalsLoaded && <InfoBoxLoader />}
          </Flex>
        ) : (
          <NoDataCard
            translationNameSpace="dashboard"
            emptyText="noActivity"
          />
        )}
      </Flex>
    </Box>
  );
}
