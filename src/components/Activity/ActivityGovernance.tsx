import { Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalProposal, ActivityEventType, SnapshotProposal } from '../../types';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import { ProposalAction } from '../Proposals/ProposalActions/ProposalAction';
import { VoteContextProvider } from '../Proposals/ProposalVotes/context/VoteContext';
import { Badge } from '../ui/badges/Badge';
import { ProposalCountdown } from '../ui/proposal/ProposalCountdown';

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
      : 'created',
  );

  const {
    node: { daoAddress },
  } = useFractal();

  return (
    <Link href={DAO_ROUTES.proposal.relative(daoAddress, activity.proposalId)}>
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
            <ProposalCountdown proposal={activity} />
            <VoteContextProvider proposal={activity}>
              <ProposalAction proposal={activity} />
            </VoteContextProvider>
          </Flex>
        }
        eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
        eventDateLabel={eventDateLabel}
        isSnapshot={!!(activity as SnapshotProposal).snapshotProposalId}
      />
    </Link>
  );
}
