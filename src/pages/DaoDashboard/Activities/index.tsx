import { Box, Center, Flex, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { InfoBox } from '../../../components/ui/containers/InfoBox';
import { InfoCardLoader } from '../../../components/ui/loaders/InfoCardLoader';
import Loading from '../../../components/ui/svg/Loading';
import { ActivityFilters } from '../../../types';
import { ActivityFilter } from './ActivityFilter';
import { ActivitySort, SortBy } from './ActivitySort';
import { ActivityTreasury } from './ActivityTreasury';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const [filters, setFilters] = useState<ActivityFilters[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { parsedActivities, isActivitiesLoading } = useActivities(filters, sortBy);

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
