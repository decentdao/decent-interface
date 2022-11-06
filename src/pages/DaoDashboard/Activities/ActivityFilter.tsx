import { Button, Flex } from '@chakra-ui/react';
import { ActiveTwo, Clock, CloseX } from '@decent-org/fractal-ui';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityFilters } from './hooks/useActivities';

interface IActivityFilter {
  filters: ActivityFilters[];
  setFilters: Dispatch<SetStateAction<ActivityFilters[]>>;
}

export function ActivityFilter({ filters, setFilters }: IActivityFilter) {
  const handleClick = (filter: ActivityFilters) => {
    setFilters(prevFilterArr => {
      if (prevFilterArr.length === 3) {
        return [filter];
      }
      if (!prevFilterArr.includes(filter)) {
        return [...prevFilterArr, filter];
      }
      return prevFilterArr.filter(
        (_, index) => index === prevFilterArr.findIndex(f => f === filter)
      );
    });
  };

  const { t } = useTranslation('badge');
  return (
    <Flex
      gap="1rem"
      my="1rem"
    >
      <Button
        variant="tertiary"
        data-testid="filter-pending"
        leftIcon={<Clock />}
        onClick={() => handleClick(ActivityFilters.Pending)}
        isDisabled={filters.includes(ActivityFilters.Pending) && filters.length < 3}
      >
        {t('pending')}
      </Button>
      <Button
        variant="tertiary"
        data-testid="filter-active"
        leftIcon={<ActiveTwo />}
        onClick={() => handleClick(ActivityFilters.Active)}
        isDisabled={filters.includes(ActivityFilters.Active) && filters.length < 3}
      >
        {t('active')}
      </Button>
      <Button
        variant="tertiary"
        data-testid="filter-rejected"
        leftIcon={<CloseX />}
        onClick={() => handleClick(ActivityFilters.Rejected)}
        isDisabled={filters.includes(ActivityFilters.Rejected) && filters.length < 3}
      >
        {t('rejected')}
      </Button>
    </Flex>
  );
}
