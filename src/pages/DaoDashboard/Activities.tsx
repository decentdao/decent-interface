import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { ActivityFilter } from './ActivityFilter';

export function Activities() {
  const [filters, setFilters] = useState<string[]>(['pending', 'active', 'rejected']);
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
      </Flex>
    </Box>
  );
}
