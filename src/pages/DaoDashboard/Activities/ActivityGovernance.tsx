import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badges/Badge';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../routes/constants';
import { Activity } from '../../../types';
import { AcitivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityGovernance({ asset }: { asset: Activity }) {
  const navigate = useNavigate();
  const {
    gnosis: { safe },
  } = useFractal();
  return (
    <AcitivityCard
      Badge={
        asset.eventState && (
          <Badge
            labelKey={asset.eventState}
            size="base"
          />
        )
      }
      description={<ActivityDescription asset={asset} />}
      RightElement={
        <Button
          variant="secondary"
          onClick={() =>
            navigate(DAO_ROUTES.proposal.relative(safe.address, asset.eventSafeTxHash))
          }
        >
          View
        </Button>
      }
      eventDate={asset.eventDate}
    />
  );
}
