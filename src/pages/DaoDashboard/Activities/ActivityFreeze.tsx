import { Flex, Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badges/Badge';
import { AcitivityCard } from './ActivityCard';
import { FreezeDescription } from './ActivityDescription';

export function ActivityFreeze() {
  const { t } = useTranslation('dashboard');
  // state should exist here

  return (
    <AcitivityCard
      Badge={
        <Badge
          labelKey="stateFreezeInit"
          size="base"
        />
      }
      description={<FreezeDescription />}
      RightElement={
        <Flex
          color="sand.700"
          alignItems="center"
          gap="1rem"
        >
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
