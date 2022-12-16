import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ActivityCard } from '../../../components/Activity/ActivityCard';
import { FreezeButton } from '../../../components/Activity/FreezeButton';
import { Badge } from '../../../components/ui/badges/Badge';
import {
  IGnosisFreezeData,
  IGnosisVetoContract,
} from '../../../providers/Fractal/governance/types';

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
  freezeData,
  vetoContract,
  currentTime,
}: {
  freezeData: IGnosisFreezeData;
  vetoContract: IGnosisVetoContract;
  currentTime: BigNumber;
}) {
  const { t } = useTranslation('dashboard');

  const daysLeft = freezeData.isFrozen
    ? freezeData.freezeProposalCreatedTime.add(freezeData.freezePeriod).sub(currentTime).gt(0)
      ? Math.round(
          freezeData.freezeProposalCreatedTime
            .add(freezeData.freezeProposalPeriod)
            .sub(currentTime)
            .div(86400)
            .toNumber()
        )
      : 0
    : freezeData.freezeProposalCreatedTime
        .add(freezeData.freezeProposalPeriod)
        .sub(currentTime)
        .gt(0)
    ? Math.round(
        freezeData.freezeProposalCreatedTime
          .add(freezeData.freezeProposalPeriod)
          .sub(currentTime)
          .div(86400)
          .toNumber()
      )
    : 0;

  return (
    <ActivityCard
      Badge={
        <Badge
          labelKey={freezeData.isFrozen ? 'stateFrozen' : 'stateFreezeInit'}
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
                label={
                  freezeData.freezeProposalVoteCount.toString() +
                  ' / ' +
                  freezeData.freezeVotesThreshold.toString() +
                  t('tipFreeze')
                }
                placement="bottom"
              >
                {freezeData.freezeProposalVoteCount.toString() +
                  ' / ' +
                  freezeData.freezeVotesThreshold.toString()}
              </Tooltip>
            )}
          </Text>
          {daysLeft > 0 && (
            <Text textStyle="text-base-sans-regular">{daysLeft + t('freezeDaysLeft')}</Text>
          )}
          {!freezeData.isFrozen && vetoContract.vetoVotingContract && (
            <FreezeButton
              isFrozen={freezeData.isFrozen}
              userHasFreezeVoted={freezeData.userHasFreezeVoted}
              vetoVotingContract={vetoContract.vetoVotingContract}
            />
          )}
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
