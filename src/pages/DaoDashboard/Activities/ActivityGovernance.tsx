import { Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badges/Badge';
import ProposalTime from '../../../components/ui/proposal/ProposalTime';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import {
  GovernanceActivity,
  TxProposalState,
  UsulProposal,
} from '../../../providers/Fractal/types';
import { DAO_ROUTES } from '../../../routes/constants';
import { ActivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityGovernance({ activity }: { activity: GovernanceActivity }) {
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
            usulProposal.deadline * 1000 > now.getMilliseconds() &&
            usulProposal.state === TxProposalState.Active && (
              <ProposalTime deadline={usulProposal.deadline} />
            )}
          <Button
            variant="secondary"
            onClick={() =>
              navigate(DAO_ROUTES.proposal.relative(safe.address, activity.transactionHash))
            }
          >
            {t('view')}
          </Button>
        </Flex>
      }
      eventDate={activity.eventDate}
    />
  );
}
