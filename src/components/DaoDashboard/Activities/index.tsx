import { Box, Flex } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalProposal, SortBy } from '../../../types';
import ProposalCard from '../../Proposals/ProposalCard/ProposalCard';
import NoDataCard from '../../ui/containers/NoDataCard';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import { Sort } from '../../ui/utils/Sort';
import { ActivityFreeze } from './ActivityFreeze';

export function Activities() {
  const {
    guardContracts: { freezeVotingContractAddress },
    guard,
    governance: { type, loadingProposals, allProposalsLoaded, proposals },
  } = useFractal();
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities: FractalProposal[] = useMemo(() => {
    return (proposals || []).sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
  }, [sortBy, proposals]);

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
