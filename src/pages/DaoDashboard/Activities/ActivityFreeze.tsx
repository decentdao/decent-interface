import { Flex, Text, Button, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badges/Badge';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { AcitivityCard } from './ActivityCard';
import { FreezeDescription } from './ActivityDescription';

export function ActivityFreeze() {
  const { t } = useTranslation('dashboard');
  // state should exist here
  const currentVotes = '6000';
  const totalNeeded = '10000';

  const {
    gnosis: { guard },
  } = useFractal();
  console.log(guard);

  return (
    <AcitivityCard
      Badge={
        <Badge
          labelKey={guard.isFrozen ? 'stateFrozen' : 'stateFreezeInit'}
          size="base"
        />
      }
      description={<FreezeDescription />}
      RightElement={
        <Flex
          color="blue.500"
          alignItems="center"
          gap="2rem"
        >
          <Text textStyle="text-base-sans-regular">
            <Tooltip
              label={currentVotes + ' / ' + totalNeeded + t('tipFreeze')}
              placement="bottom"
            >
              {currentVotes + ' / ' + totalNeeded}
            </Tooltip>
          </Text>
          <Text textStyle="text-base-sans-regular">{t('freezeDaysLeft')}</Text>
          <Button
            variant="ghost"
            bgColor={'black.900'}
            border="1px"
            borderColor={'blue.500'}
            textColor={'blue.500'}
            onClick={() => {}}
          >
            {t('freezeButton')}
          </Button>
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
