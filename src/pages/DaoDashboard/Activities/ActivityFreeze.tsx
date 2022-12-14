import { Flex, Text, Button, Tooltip } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ActivityCard } from '../../../components/Activity/ActivityCard';
import { Badge } from '../../../components/ui/badges/Badge';
import useBlockTimestamp from '../../../hooks/utils/useBlockTimestamp';
// import useCurrentBlockNumber from '../../../hooks/utils/useCurrentBlockNumber';
// import useCurrentTimestamp from '../../../hooks/utils/useCurrentTimestamp';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
// import { AcitivityCard } from './ActivityCard';
// import { FreezeDescription } from './ActivityDescription';

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

export function ActivityFreeze() {
  const { t } = useTranslation('dashboard');

  const {
    gnosis: { guard },
  } = useFractal();
  const currentTime = BigNumber.from(useBlockTimestamp());
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

  // check isFreezeInit
  // check isFrozen
  // check userHasFreezeVoted
  // check userCanFreezeVote
  // update button during Frozen state / already voted stage

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
          {!guard.isFrozen && (
            <Button
              variant="ghost"
              bgColor={'black.900'}
              border="1px"
              borderColor={'blue.500'}
              textColor={'blue.500'}
              onClick={() => {}}
              disabled={guard.isFrozen || guard.userHasFreezeVoted}
            >
              {guard.userHasFreezeVoted ? t('freezeVotedButton') : t('freezeButton')}
            </Button>
          )}
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
