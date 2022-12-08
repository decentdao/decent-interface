import { Box, Button, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sort } from '../../../components/ui/Sort';
import { Badge } from '../../../components/ui/badges/Badge';
import { EmptyBox } from '../../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import { ActivityEventType, SortBy } from '../../../types';
import { AcitivityCard } from './ActivityCard';
import { ActivityFreeze } from './ActivityFreeze';
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
          <ActivityFreeze />
          {sortedActivities.map((asset, i) => {
            if (asset.eventType === ActivityEventType.Governance) {
              return (
                <ActivityGovernance
                  key={i}
                  asset={asset}
                />
              );
            }
            return (
              <ActivityTreasury
                key={i}
                asset={asset}
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
