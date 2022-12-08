import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badges/Badge';
import { AcitivityCard } from './ActivityCard';
import { FreezeDescription } from './ActivityDescription';

export function ActivityFreeze() {
  const { t } = useTranslation();

  return (
    <AcitivityCard
      Badge={
        <Badge
          labelKey="stateFreezeInit"
          size="base"
        />
      }
      description={<FreezeDescription description="Freeze initiated on transaction" />}
      RightElement={<Button variant="secondary">{t('view')}</Button>}
      eventDate={'wow'}
    />
  );
}
