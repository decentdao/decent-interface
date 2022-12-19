import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ActivityCard } from '../../../components/Activity/ActivityCard';
import { FreezeButton } from '../../../components/Activity/FreezeButton';
import { Badge } from '../../../components/ui/badges/Badge';
import useWithinFreezePeriod from '../../../hooks/utils/useWithinFreezePeriod';
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
  const withinFreezeProposalPeriod = useWithinFreezePeriod(freezeData) as {
    secondsLeft: BigNumber;
    withinPeriod: boolean;
  };
  const withinFreezePeriod = useWithinFreezePeriod(freezeData, true) as {
    secondsLeft: BigNumber;
    withinPeriod: boolean;
  };

  if (
    !freezeData.isFrozen ||
    (withinFreezeProposalPeriod && !withinFreezeProposalPeriod.withinPeriod)
  ) {
    return null;
  }

  const daysLeft = freezeData.isFrozen
    ? withinFreezePeriod.withinPeriod
      ? Math.round(withinFreezePeriod.secondsLeft.div(86400).toNumber())
      : 0
    : withinFreezeProposalPeriod.withinPeriod
    ? Math.round(withinFreezeProposalPeriod.secondsLeft.div(86400).toNumber())
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
