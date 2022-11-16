import {
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Grid,
  GridItem,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Proposal } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';
import ProgressBar from '../ui/ProgressBar';

function VotesPercentage({ label, percentage }: { label: string; percentage: number }) {
  return (
    <Flex
      flexWrap="wrap"
      marginTop={2}
    >
      <Text
        marginTop={2}
        marginBottom={2}
      >
        {label}
      </Text>
      <ProgressBar value={percentage} />
    </Flex>
  );
}

function ProposalVotes({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation(['common', 'proposal']);
  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-xl-mono-bold">{t('breakdownTitle', { ns: 'proposal' })}</Text>
      <Grid
        templateColumns="repeat(5, 1fr)"
        gap={7}
      >
        <GridItem colSpan={1}>
          <CircularProgress
            color="drab.900"
            trackColor="drab.700"
            value={proposal.votes.yes.toNumber()}
            size="156px"
            marginTop={4}
          >
            <CircularProgressLabel>
              <Text
                textStyle="text-lg-mono-regular"
                color="grayscale.100"
              >
                {proposal.votes.yes.toNumber()}%
              </Text>
              <Text
                textStyle="text-lg-mono-regular"
                color="grayscale.100"
              >
                {t('yes')}
              </Text>
            </CircularProgressLabel>
          </CircularProgress>
        </GridItem>
        <GridItem
          colSpan={4}
          rowGap={4}
        >
          <VotesPercentage
            label={t('yes')}
            percentage={proposal.votes.yes.toNumber()}
          />
          <VotesPercentage
            label={t('no')}
            percentage={proposal.votes.no.toNumber()}
          />

          <VotesPercentage
            label={t('abstain')}
            percentage={proposal.votes.abstain.toNumber()}
          />
        </GridItem>
      </Grid>
    </ContentBox>
  );
}

export default ProposalVotes;
