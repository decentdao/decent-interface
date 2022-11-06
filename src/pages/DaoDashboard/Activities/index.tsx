import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { InfoCardLoader } from '../../../components/ui/loaders/InfoCardLoader';
import { ActivityFilters } from '../../../types';
import { ActivityFilter } from './ActivityFilter';
import { ActivitySort, SortBy } from './ActivitySort';
import { ActivityTreasury } from './ActivityTreasury';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const [filters, setFilters] = useState<ActivityFilters[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { sortedActivities, isActivitiesLoading } = useActivities(filters, sortBy);

  if (isActivitiesLoading) {
    return <InfoCardLoader />;
  }
  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <ActivityFilter
          filters={filters}
          setFilters={setFilters}
        />
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
