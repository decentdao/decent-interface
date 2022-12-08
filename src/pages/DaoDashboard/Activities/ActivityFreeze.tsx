import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badges/Badge';
import { AcitivityCard } from './ActivityCard';
import { FreezeDescription } from './ActivityDescription';

export function ActivityFreeze() {
  const { t } = useTranslation('dashboard');

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
      }
      eventDate={'wow'}
      boxBorderColor={'blue.500'}
    />
  );
}
