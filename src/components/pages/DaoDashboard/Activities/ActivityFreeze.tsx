import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { ERC20FreezeVoting, MultisigFreezeVoting } from '@fractal-framework/fractal-contracts';
import { useTranslation } from 'react-i18next';
import { useDateTimeDisplay } from '../../../../helpers/dateTime';
import { DAOState, FreezeGuard } from '../../../../types';
import { ActivityCard } from '../../../Activity/ActivityCard';
import { FreezeButton } from '../../../Activity/FreezeButton';
import { Badge } from '../../../ui/badges/Badge';

export function FreezeDescription({ isFrozen }: { isFrozen: boolean }) {
  const { t } = useTranslation('dashboard');
  return (
    <Text
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
    >
      {t(isFrozen ? 'frozenDescription' : 'freezeDescription')}
    </Text>
  );
}

export function ActivityFreeze({
  freezeGuard,
  freezeVotingContract: freezeVotingContract,
}: {
  freezeGuard: FreezeGuard;
  freezeVotingContract: ERC20FreezeVoting | MultisigFreezeVoting | undefined;
}) {
  const {
    freezeProposalCreatedTime,
    freezeProposalPeriod,
    freezePeriod,
    freezeVotesThreshold,
    freezeProposalVoteCount,
  } = freezeGuard;
  const { t } = useTranslation('dashboard');
  const freezeProposalDeadlineDate = new Date(
    freezeProposalCreatedTime!.add(freezeProposalPeriod!).mul(1000).toNumber()
  );
  const freezeDeadlineDate = new Date(
    freezeProposalCreatedTime!.add(freezePeriod!).mul(1000).toNumber()
  );
  const now = new Date();

  const freezeProposalPeriodDiffReadable = useDateTimeDisplay(freezeProposalDeadlineDate);
  const freezePeriodDiffReadable = useDateTimeDisplay(freezeDeadlineDate);
  const isFreezeProposalDeadlinePassed = now.getTime() > freezeProposalDeadlineDate.getTime();
  const isFreezeDeadlinePassed = now.getTime() > freezeDeadlineDate.getTime();

  if (isFreezeProposalDeadlinePassed && isFreezeDeadlinePassed) {
    return null;
  }

  const voteToThreshold =
    freezeProposalVoteCount!.toString() + ' / ' + freezeVotesThreshold!.toString();

  return (
    <ActivityCard
      Badge={
        <Badge
          labelKey={freezeGuard.isFrozen ? DAOState.frozen : DAOState.freezeInit}
          size="base"
        />
      }
      description={<FreezeDescription isFrozen={freezeGuard.isFrozen} />}
      RightElement={
        <Flex
          color="blue.500"
          alignItems="center"
          gap="2rem"
        >
          <Text textStyle="text-base-sans-regular">
            {!freezeGuard.isFrozen && freezeVotesThreshold!.gt(0) && (
              <Tooltip
                label={t('tipFreeze', { amount: voteToThreshold })}
                placement="bottom"
              >
                {voteToThreshold}
              </Tooltip>
            )}
          </Text>
          {!isFreezeProposalDeadlinePassed && !isFreezeDeadlinePassed && (
            <Text textStyle="text-base-sans-regular">
              {freezeGuard.isFrozen ? freezePeriodDiffReadable : freezeProposalPeriodDiffReadable}
            </Text>
          )}
          {!freezeGuard.isFrozen && freezeVotingContract && (
            <FreezeButton
              isFrozen={freezeGuard.isFrozen}
              userHasFreezeVoted={freezeGuard.userHasFreezeVoted}
              userHasVotes={freezeGuard.userHasVotes}
              freezeVotingContract={freezeVotingContract}
            />
          )}
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
