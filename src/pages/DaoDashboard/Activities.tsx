import { Button, Flex } from '@chakra-ui/react';
import { ActiveTwo, Clock, CloseX } from '@decent-org/fractal-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Activities() {
  const [filters, setFilters] = useState<string[]>(['pending', 'active', 'rejected']);

  const handleClick = (filter: string) => {
    setFilters(prevFilterArr => {
      if (prevFilterArr.length === 3) {
        if (filter === 'all') {
          return ['pending', 'active', 'rejected'];
        }
        return [filter];
      }
      if (!prevFilterArr.includes(filter) && filter !== 'all') {
        return [...prevFilterArr, filter];
      }
      return prevFilterArr.filter(
        (_, index) => index === prevFilterArr.findIndex(f => f === filter)
      );
    });
  };

  const filterColors = useCallback(
    (filter: string) => {
      if (filter === 'all' && filters.length === 3) {
        return;
      } else if (filters.includes(filter) && filters.length < 3) {
        return;
      }
      return {
        borderColor: 'grayscale.100',
        color: 'grayscale.100',
      };
    },
    [filters]
  );

  const { t } = useTranslation('badge');
  return (
    <Flex
      gap="1rem"
      my="1rem"
    >
      <Button
        variant="tertiary"
        data-testid="filter-all"
        onClick={() => handleClick('all')}
        {...filterColors('all')}
      >
        {t('all')}
      </Button>
      <Button
        variant="tertiary"
        data-testid="filter-pending"
        leftIcon={<Clock />}
        onClick={() => handleClick('pending')}
        {...filterColors('pending')}
      >
        {t('pending')}
      </Button>
      <Button
        variant="tertiary"
        data-testid="filter-active"
        leftIcon={<ActiveTwo />}
        onClick={() => handleClick('active')}
        {...filterColors('active')}
      >
        {t('active')}
      </Button>
      <Button
        variant="tertiary"
        data-testid="filter-rejected"
        leftIcon={<CloseX />}
        onClick={() => handleClick('rejected')}
        {...filterColors('rejected')}
      >
        {t('rejected')}
      </Button>
    </Flex>
  );
}
