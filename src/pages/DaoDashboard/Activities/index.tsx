import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sort } from '../../../components/ui/Sort';
import { EmptyBox } from '../../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import {
  ActivityEventType,
  GovernanceActivity,
  TreasuryActivity,
} from '../../../providers/Fractal/types';
import { SortBy } from '../../../types';
import { ActivityGovernance } from './ActivityGovernance';
import { ActivityTreasury } from './ActivityTreasury';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { sortedActivities, isActivitiesLoading } = useActivities(sortBy);
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
      {isActivitiesLoading ? (
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
                  activity={activity as GovernanceActivity}
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
    </Box>
  );
}
