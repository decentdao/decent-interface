import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { useTranslation } from 'react-i18next';
import { ActivityCard } from '../../../components/Activity/ActivityCard';
import { FreezeButton } from '../../../components/Activity/FreezeButton';
import { Badge } from '../../../components/ui/badges/Badge';
import { useDateTimeDisplay } from '../../../helpers/dateTime';
import { DAOState, IGnosisFreezeData } from '../../../providers/Fractal/governance/types';

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
  freezeData,
  vetoVotingContract,
}: {
  freezeData: IGnosisFreezeData;
  vetoVotingContract: VetoERC20Voting | VetoMultisigVoting | undefined;
}) {
  const { t } = useTranslation('dashboard');
  const freezeProposalDeadlineDate = new Date(
    freezeData.freezeProposalCreatedTime.add(freezeData.freezeProposalPeriod).mul(1000).toNumber()
  );
  const freezeDeadlineDate = new Date(
    freezeData.freezeProposalCreatedTime.add(freezeData.freezePeriod).mul(1000).toNumber()
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
    freezeData.freezeProposalVoteCount.toString() +
    ' / ' +
    freezeData.freezeVotesThreshold.toString();

  return (
    <ActivityCard
      Badge={
        <Badge
          labelKey={freezeData.isFrozen ? DAOState.frozen : DAOState.freezeInit}
          size="base"
        />
      }
      description={<FreezeDescription isFrozen={freezeData.isFrozen} />}
      RightElement={
        <Flex
          color="blue.500"
          alignItems="center"
          gap="2rem"
        >
          <Text textStyle="text-base-sans-regular">
            {!freezeData.isFrozen && freezeData.freezeVotesThreshold.gt(0) && (
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
              {freezeData.isFrozen ? freezePeriodDiffReadable : freezeProposalPeriodDiffReadable}
            </Text>
          )}
          {!freezeData.isFrozen && vetoVotingContract && (
            <FreezeButton
              isFrozen={freezeData.isFrozen}
              userHasFreezeVoted={freezeData.userHasFreezeVoted}
              userHasVotes={freezeData.userHasVotes}
              vetoVotingContract={vetoVotingContract}
            />
          )}
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
