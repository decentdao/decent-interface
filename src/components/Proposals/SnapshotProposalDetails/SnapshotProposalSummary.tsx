import { Text, Box, Button, Divider, Flex, Tooltip } from '@chakra-ui/react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { ExtendedSnapshotProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import ExternalLink from '../../ui/links/ExternalLink';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import { QuorumProgressBar } from '../../ui/utils/ProgressBar';
import { InfoRow } from '../MultisigProposalDetails/TxDetails';
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
      variant="link"
      textStyle="text-base-sans-regular"
      color="gold.500"
      onClick={toggleShowVotingPower}
    >
      {showVotingPower ? votingWeight : t('show')}
    </Button>
  );

  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('votingSystem')}
          value={t(getVotingSystemTitle())}
        />
        <Flex
          marginTop={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
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
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('votingPower')}
          </Text>
          {showVotingPower ? (
            <Tooltip label={t('votingPowerTooltip')}>{ShowVotingPowerButton}</Tooltip>
          ) : (
            ShowVotingPowerButton
          )}
        </Flex>
        <Divider
          color="chocolate.700"
          marginTop={4}
        />
        {!!proposal.quorum && (
          <Box marginTop={4}>
            <QuorumProgressBar
              reachedQuorum={totalVotesCasted.toString()}
              totalQuorum={proposal.quorum?.toString()}
              unit=""
            />
          </Box>
        )}
      </Box>
    </ContentBox>
  );
}
