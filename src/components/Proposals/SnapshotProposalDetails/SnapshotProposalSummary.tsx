import { Text, Box, Button, Flex, Tooltip } from '@chakra-ui/react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TOOLTIP_MAXW } from '../../../constants/common';
import { ExtendedSnapshotProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import ExternalLink from '../../ui/links/ExternalLink';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import InfoRow from '../../ui/proposal/InfoRow';
import Divider from '../../ui/utils/Divider';
import { QuorumProgressBar } from '../../ui/utils/ProgressBar';
import useSnapshotUserVotingWeight from './hooks/useSnapshotUserVotingWeight';
import useTotalVotes from './hooks/useTotalVotes';

interface ISnapshotProposalSummary {
  proposal?: ExtendedSnapshotProposal;
}

export default function SnapshotProposalSummary({ proposal }: ISnapshotProposalSummary) {
  const { t } = useTranslation(['proposal', 'common', 'navigation']);
  const { totalVotesCasted } = useTotalVotes({ proposal });
  const { votingWeight } = useSnapshotUserVotingWeight({ proposal });
  const [showVotingPower, setShowVotingPower] = useState(false);

  const toggleShowVotingPower = () => setShowVotingPower(prevState => !prevState);

  if (!proposal) {
    return (
      <Box mt={4}>
        <InfoBoxLoader />
      </Box>
    );
  }

  const getVotingSystemTitle = () => {
    switch (proposal.type) {
      case 'basic':
        return 'basicSnapshotVotingSystem';
      case 'single-choice':
        return 'singleSnapshotVotingSystem';
      case 'weighted':
        return 'weightedSnapshotVotingSystem';
      default:
        return 'unknownSnapshotVotingSystem';
    }
  };

  const ShowVotingPowerButton = (
    <Button
      pr={0}
      py={0}
      height="auto"
      justifyContent="flex-end"
      alignItems="flex-start"
      variant="text"
      textStyle="body-base"
      color="celery-0"
      onClick={toggleShowVotingPower}
    >
      {showVotingPower ? votingWeight : t('show')}
    </Button>
  );

  return (
    <ContentBox
      containerBoxProps={{
        bg: 'neutral-2',
        border: '1px solid',
        borderColor: 'neutral-3',
        borderRadius: '0.5rem',
        my: 0,
      }}
    >
      <Text textStyle="display-lg">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider variant="darker" />
        <InfoRow
          property={t('votingSystem')}
          value={t(getVotingSystemTitle())}
        />
        <Flex
          marginTop={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="body-base"
            color="neutral-7"
          >
            {t('ipfs')}
          </Text>
          <ExternalLink href={`https://snapshot.4everland.link/ipfs/${proposal.ipfs}`}>
            #{proposal.ipfs.slice(0, 7)}
          </ExternalLink>
        </Flex>
        <InfoRow
          property={t('proposalSummaryStartDate')}
          value={format(proposal.startTime * 1000, DEFAULT_DATE_TIME_FORMAT)}
          tooltip={formatInTimeZone(proposal.startTime * 1000, 'GMT', DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryEndDate')}
          value={format(proposal.endTime * 1000, DEFAULT_DATE_TIME_FORMAT)}
          tooltip={formatInTimeZone(proposal.endTime * 1000, 'GMT', DEFAULT_DATE_TIME_FORMAT)}
        />
        <Flex
          marginTop={4}
          marginBottom={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="body-base"
            color="neutral-7"
          >
            {t('votingPower')}
          </Text>
          {showVotingPower ? (
            <Tooltip
              label={t('votingPowerTooltip')}
              placement="top"
              maxW={TOOLTIP_MAXW}
            >
              {ShowVotingPowerButton}
            </Tooltip>
          ) : (
            ShowVotingPowerButton
          )}
        </Flex>
        <Divider
          marginTop={4}
          variant="darker"
        />
        {!!proposal.quorum && (
          <Box marginTop={4}>
            <QuorumProgressBar
              reachedQuorum={BigInt(totalVotesCasted)}
              totalQuorum={proposal.quorum ? BigInt(proposal.quorum) : undefined}
              unit=""
            />
          </Box>
        )}
      </Box>
    </ContentBox>
  );
}
