import { Text, Box, Divider, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { ExtendedSnapshotProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import ExternalLink from '../../ui/links/ExternalLink';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import { ExtendedProgressBar } from '../../ui/utils/ProgressBar';
import { InfoRow } from '../MultisigProposalDetails/TxDetails';

interface ISnapshotProposalSummary {
  proposal?: ExtendedSnapshotProposal;
}

export default function SnapshotProposalSummary({ proposal }: ISnapshotProposalSummary) {
  const [totalVotesCasted, setTotalVotesCasted] = useState(0);
  const { t } = useTranslation(['proposal', 'common', 'navigation']);

  useEffect(() => {
    if (proposal) {
      let newTotalVotesCasted = 0;
      Object.keys(proposal.votesBreakdown).forEach(voteChoice => {
        const voteChoiceBreakdown = proposal.votesBreakdown[voteChoice];
        newTotalVotesCasted += voteChoiceBreakdown.total;
      });

      if (newTotalVotesCasted !== totalVotesCasted) {
        setTotalVotesCasted(newTotalVotesCasted);
      }
    }
  }, [proposal, totalVotesCasted]);

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
      case 'single':
        return 'singleSnapshotVotingSystem';
      default:
        return 'unknownSnapshotVotingSystem';
    }
  };

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
        {proposal.privacy === 'shutter' && (
          <Flex
            marginTop={4}
            justifyContent="space-between"
          >
            <Text
              textStyle="text-base-sans-regular"
              color="chocolate.200"
            >
              {t('privacy')}
            </Text>
            <ExternalLink
              href={
                'https://blog.shutter.network/announcing-shutter-governance-shielded-voting-for-daos/'
              }
            >
              {t('shutterPrivacy')}
            </ExternalLink>
          </Flex>
        )}
        <InfoRow
          property={t('proposalSummaryStartDate')}
          value={format(proposal.startTime * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryEndDate')}
          value={format(proposal.endTime * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <Divider
          color="chocolate.700"
          marginTop={4}
        />
        {(proposal.quorum || proposal.quorum === 0) && (
          <Box marginTop={4}>
            <ExtendedProgressBar
              label={t('quorum', { ns: 'common' })}
              helperText={proposal.privacy === 'shutter' ? t('shutterQuorumHelper') : undefined}
              percentage={proposal.quorum > 0 ? totalVotesCasted / proposal.quorum : 100}
              requiredPercentage={100}
              unit=""
            />
          </Box>
        )}
      </Box>
    </ContentBox>
  );
}
