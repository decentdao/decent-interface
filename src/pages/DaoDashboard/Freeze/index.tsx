import { Box, Button, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sort } from '../../../components/ui/Sort';
import { EmptyBox } from '../../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import { ActivityEventType, SortBy } from '../../../types';
import { ActionCard } from '../Activities/ActionCard';
import { ActivityGovernance } from '../Activities/ActivityGovernance';
import { ActivityTreasury } from '../Activities/ActivityTreasury';
import { useActivities } from '../Activities/hooks/useActivities';

export function Freeze() {
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { sortedActivities, isActivitiesLoading } = useActivities(sortBy);
  const { t } = useTranslation('dashboard');
  return (
    <Box>
      <Flex
        flexDirection="column"
        gap="1rem"
        my="1rem"
      >
        <ActionCard
          Badge={''}
          description={''}
          RightElement={
            <Button
              variant="text"
              size="lg"
              px="0px"
            >
              {t('labelEtherscan')}
            </Button>
          }
          eventDate={''}
        />
      </Flex>
    </Box>
  );
}
