import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { ActivityFilter } from './ActivityFilter';
import { ActivitySort, SortBy } from './ActivitySort';
import { ActivityTreasury } from './ActivityTreasury';
import { ActivityFilters, useActivities } from './hooks/useActivities';

export function Activities() {
  const [filters, setFilters] = useState<ActivityFilters[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { parsedActivities } = useActivities(filters, sortBy);
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
        {parsedActivities.map((asset, i) => (
          <ActivityTreasury
            key={i}
            asset={asset}
          />
        ))}
      </Flex>
    </Box>
  );
}
