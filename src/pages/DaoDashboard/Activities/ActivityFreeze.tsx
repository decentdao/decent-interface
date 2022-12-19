import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ActivityCard } from '../../../components/Activity/ActivityCard';
import { FreezeButton } from '../../../components/Activity/FreezeButton';
import { Badge } from '../../../components/ui/badges/Badge';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
  secondsLeftInFreezePeriod,
  secondsLeftInFreezeProposalPeriod,
} from '../../../helpers/freezePeriodHelpers';
import useBlockTimestamp from '../../../hooks/utils/useBlockTimestamp';
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
  const currentTime = BigNumber.from(useBlockTimestamp());

  const withinFreezeProposalPeriod = isWithinFreezeProposalPeriod(freezeData, currentTime);
  const withinFreezePeriod = isWithinFreezePeriod(freezeData, currentTime);

  if (!withinFreezePeriod && !withinFreezeProposalPeriod) {
    return null;
  }

  const daysLeft = freezeData.isFrozen
    ? withinFreezePeriod
      ? Math.round(secondsLeftInFreezePeriod(freezeData, currentTime).div(86400).toNumber())
      : 0
    : withinFreezeProposalPeriod
    ? Math.round(secondsLeftInFreezeProposalPeriod(freezeData, currentTime).div(86400).toNumber())
    : 0;
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
                label={voteToThreshold + t('tipFreeze')}
                placement="bottom"
              >
                {voteToThreshold}
              </Tooltip>
            )}
          </Text>
          {daysLeft > 0 && (
            <Text textStyle="text-base-sans-regular">
              {daysLeft + t('freezeDaysLeft', { count: daysLeft })}
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
