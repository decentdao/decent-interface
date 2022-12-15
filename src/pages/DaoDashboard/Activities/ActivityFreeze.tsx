import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ActivityCard } from '../../../components/Activity/ActivityCard';
import { FreezeButton } from '../../../components/Activity/FreezeButton';
import { Badge } from '../../../components/ui/badges/Badge';
import { IGnosisVetoData } from '../../../providers/Fractal/types/governance';
//todo: button colors if frozen
//todo: get button working

export function FreezeDescription({ isFrozen }: { isFrozen: boolean }) {
  const { t } = useTranslation('dashboard');
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      flexWrap="wrap"
    >
      <Text> {isFrozen ? t('frozenDescription') : t('freezeDescription')}</Text>
    </Flex>
  );
}

export function ActivityFreeze({
  guard,
  currentTime,
}: {
  guard: IGnosisVetoData;
  currentTime: BigNumber;
}) {
  const { t } = useTranslation('dashboard');

  const daysLeft = guard.isFrozen
    ? guard.freezeProposalCreatedTime.add(guard.freezePeriod).sub(currentTime).gt(0)
      ? Math.round(
          guard.freezeProposalCreatedTime
            .add(guard.freezeProposalPeriod)
            .sub(currentTime)
            .div(86400)
            .toNumber()
        )
      : 0
    : guard.freezeProposalCreatedTime.add(guard.freezeProposalPeriod).sub(currentTime).gt(0)
    ? Math.round(
        guard.freezeProposalCreatedTime
          .add(guard.freezeProposalPeriod)
          .sub(currentTime)
          .div(86400)
          .toNumber()
      )
    : 0;

  return (
    <ActivityCard
      Badge={
        <Badge
          labelKey={guard.isFrozen ? 'stateFrozen' : 'stateFreezeInit'}
          size="base"
        />
      }
      description={<FreezeDescription isFrozen={guard.isFrozen} />}
      RightElement={
        <Flex
          color="blue.500"
          alignItems="center"
          gap="2rem"
        >
          <Text textStyle="text-base-sans-regular">
            {!guard.isFrozen && guard.freezeVotesThreshold.gt(0) && (
              <Tooltip
                label={
                  guard.freezeProposalVoteCount.toString() +
                  ' / ' +
                  guard.freezeVotesThreshold.toString() +
                  t('tipFreeze')
                }
                placement="bottom"
              >
                {guard.freezeProposalVoteCount.toString() +
                  ' / ' +
                  guard.freezeVotesThreshold.toString()}
              </Tooltip>
            )}
          </Text>
          {daysLeft > 0 && (
            <Text textStyle="text-base-sans-regular">{daysLeft + t('freezeDaysLeft')}</Text>
          )}
          {!guard.isFrozen && guard.vetoVotingContract && (
            <FreezeButton
              isFrozen={guard.isFrozen}
              userHasFreezeVoted={guard.userHasFreezeVoted}
              vetoVotingContract={guard.vetoVotingContract}
            />
          )}
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
