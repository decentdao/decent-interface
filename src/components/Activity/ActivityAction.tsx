import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { UsulProposal, TxProposalState, TxProposal } from '../../providers/Fractal/types';
import { ProposalAction } from '../Proposals/ProposalActions/ProposalAction';
import ProposalTime from '../ui/proposal/ProposalTime';

export default function ActivityAction({ activity }: { activity: TxProposal }) {
  const { t } = useTranslation('proposal');
  const isActive = activity.state === TxProposalState.Active;
  const isTimeLocked = activity.state === TxProposalState.TimeLocked;
  const isExecutable = activity.state === TxProposalState.Executing;
  const isQueued = activity.state === TxProposalState.Queued;
  const showCountdown = isActive || isTimeLocked || isExecutable || isQueued;

  const usulProposal = activity as UsulProposal;

  return (
    <Flex
      gap={4}
      alignItems="center"
    >
      {showCountdown && (
        <ProposalTime
          tooltipLabel={t(
            isActive
              ? 'votingTooltip'
              : isTimeLocked || isQueued
              ? 'timeLockedTooltip'
              : isExecutable
              ? 'executableTooltip'
              : ''
          )}
          deadline={usulProposal.deadline}
          icon={
            isActive
              ? 'vote'
              : isTimeLocked || isQueued
              ? 'lock'
              : isExecutable
              ? 'execute'
              : undefined
          }
        />
      )}
      <ProposalAction proposal={activity} />
    </Flex>
  );
}
