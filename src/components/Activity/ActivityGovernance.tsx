import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { TxProposal, ActivityEventType } from '../../providers/Fractal/types';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import { Badge } from '../ui/badges/Badge';
import ActivityAction from './ActivityAction';

import { ActivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityGovernance({ activity }: { activity: TxProposal }) {
  const {
    gnosis: { safe },
  } = useFractal();
  const { t } = useTranslation();

  const eventDateLabel = t(
    activity.eventType === ActivityEventType.Treasury
      ? activity.transaction?.to === safe.address
        ? 'received'
        : 'sent'
      : 'created'
  );

  return (
    <ActivityCard
      Badge={
        activity.state && (
          <Badge
            labelKey={activity.state}
            size="base"
          />
        )
      }
      description={<ActivityDescription activity={activity} />}
      RightElement={<ActivityAction activity={activity} />}
      eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
      eventDateLabel={eventDateLabel}
    />
  );
}
