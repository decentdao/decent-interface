import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { ActivityEventType, SortBy, TreasuryActivity, FractalProposal } from '../../../../types';
import { ActivityGovernance } from '../../../Activity/ActivityGovernance';
import { ActivityModule } from '../../../Activity/ActivityModule';
import { ActivityTreasury } from '../../../Activity/ActivityTreasury';
import { EmptyBox } from '../../../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../ui/loaders/InfoBoxLoader';
import { Sort } from '../../../ui/utils/Sort';
import { ActivityFreeze } from './ActivityFreeze';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const {
    guardContracts,
    guard,
    governance: { type },
  } = useFractal();
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const { sortedActivities } = useActivities(sortBy);

  const { t } = useTranslation('dashboard');
  return (
    <Box>
      <Flex
        justifyContent="flex-end"
        alignItems="center"
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
        {guard.freezeProposalVoteCount?.gt(0) && (
          <ActivityFreeze
            freezeGuard={guard}
            vetoVotingContract={guardContracts.vetoVotingContract?.asSigner}
          />
        )}
        {!type ? (
          <InfoBoxLoader />
        ) : sortedActivities.length ? (
          <Flex
            flexDirection="column"
            gap="1rem"
          >
            {sortedActivities.map((activity, i) => {
              if (activity.eventType === ActivityEventType.Governance) {
                return (
                  <ActivityGovernance
                    key={i}
                    activity={activity as FractalProposal}
                  />
                );
              }
              if (activity.eventType === ActivityEventType.Module) {
                return (
                  <ActivityModule
                    key={i}
                    activity={activity as FractalProposal}
                  />
                );
              }
              return (
                <ActivityTreasury
                  key={i}
                  activity={activity as TreasuryActivity}
                />
              );
            })}
          </Flex>
        ) : (
          <EmptyBox emptyText={t('noActivity')} />
        )}
      </Flex>
    </Box>
  );
}
