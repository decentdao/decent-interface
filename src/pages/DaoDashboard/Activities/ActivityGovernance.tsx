import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badges/Badge';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../routes/constants';
import { GovernanceActivity } from '../../../types';
import { AcitivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityGovernance({ activity }: { activity: GovernanceActivity }) {
  const navigate = useNavigate();
  const {
    gnosis: { safe },
  } = useFractal();

  const { t } = useTranslation();

  return (
    <AcitivityCard
      Badge={
        activity.state && (
          <Badge
            labelKey={activity.state}
            size="base"
          />
        )
      }
      description={<ActivityDescription activity={activity} />}
      RightElement={
        <Button
          variant="secondary"
          onClick={() =>
            navigate(DAO_ROUTES.proposal.relative(safe.address, activity.transactionHash))
          }
        >
          {t('view')}
        </Button>
      }
      eventDate={activity.eventDate}
    />
  );
}
