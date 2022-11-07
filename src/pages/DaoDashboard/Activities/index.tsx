import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import { ActivitySort, SortBy } from './ActivitySort';
import { ActivityTreasury } from './ActivityTreasury';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { sortedActivities, isActivitiesLoading } = useActivities(sortBy);

  if (isActivitiesLoading) {
    return <InfoBoxLoader />;
  }
  return (
    <Box>
      <Flex
        justifyContent="flex-end"
        alignItems="center"
        my="1rem"
      >
        <ActivitySort
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Flex>

      <Flex
        flexDirection="column"
        gap="1rem"
      >
        {sortedActivities.map((asset, i) => (
          <ActivityTreasury
            key={i}
            asset={asset}
          />
        ))}
      </Flex>
    </Box>
  );
}
