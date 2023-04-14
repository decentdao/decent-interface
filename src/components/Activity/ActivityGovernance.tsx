import { Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalProposal, ActivityEventType } from '../../types';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import { ProposalAction } from '../Proposals/ProposalActions/ProposalAction';
import { Badge } from '../ui/badges/Badge';

import ProposalTime from '../ui/proposal/ProposalTime';
import { ActivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityGovernance({ activity }: { activity: FractalProposal }) {
  const {
    node: { safe },
  } = useFractal();
  const { t } = useTranslation();

  const eventDateLabel = t(
    activity.eventType === ActivityEventType.Treasury
      ? activity.transaction?.to === safe?.address
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
      RightElement={
        <Flex
          gap={14}
          alignItems="center"
        >
          <ProposalTime proposal={activity} />
          <ProposalAction proposal={activity} />
        </Flex>
      }
      eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
      eventDateLabel={eventDateLabel}
    />
  );
}
