import { Button, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { UsulProposal, TxProposalState, TxProposal } from '../../providers/Fractal/types';
import { DAO_ROUTES } from '../../routes/constants';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import { Badge } from '../ui/badges/Badge';
import ProposalTime from '../ui/proposal/ProposalTime';

import { ActivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityGovernance({ activity }: { activity: TxProposal }) {
  const navigate = useNavigate();
  const {
    gnosis: { safe },
  } = useFractal();

  const { t } = useTranslation();
  const usulProposal = activity as UsulProposal;
  const now = new Date();
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
          gap={4}
          alignItems="center"
        >
          {usulProposal.deadline &&
            usulProposal.deadline * 1000 > now.getTime() &&
            usulProposal.state === TxProposalState.Active && (
              <ProposalTime deadline={usulProposal.deadline} />
            )}
          <Button
            variant="secondary"
            onClick={() =>
              navigate(DAO_ROUTES.proposal.relative(safe.address, activity.proposalNumber))
            }
          >
            {t('view')}
          </Button>
        </Flex>
      }
      eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
    />
  );
}
