import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { ActivityFilter } from './ActivityFilter';
import { ActivitySort, SortBy } from './ActivitySort';

export function Activities() {
  const [filters, setFilters] = useState<string[]>(['pending', 'active', 'rejected']);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

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
    </Box>
  );
}
