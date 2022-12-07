import {
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Grid,
  GridItem,
  Text,
} from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../hooks/utils/useDisplayName';
import { Proposal, ProposalVote } from '../../providers/Fractal/types';
import { formatCoin, formatPercentage } from '../../utils/numberFormats';
import ContentBox from '../ui/ContentBox';
import ProgressBar from '../ui/ProgressBar';
import StatusBox from '../ui/badges/StatusBox';

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

function ProposalVoteItem({
  vote,
  govTokenTotalSupply,
  govTokenDecimals,
  govTokenSymbol,
}: {
  vote: ProposalVote;
  govTokenTotalSupply: BigNumber;
  govTokenDecimals: number;
  govTokenSymbol: string;
}) {
  const { t } = useTranslation();
  const { displayName } = useDisplayName(vote.voter);
  return (
    <Grid
      templateColumns="repeat(4, 1fr)"
      width="100%"
    >
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">{displayName}</Text>
      </GridItem>
      <GridItem colSpan={1}>
        <StatusBox>
          <Text textStyle="text-sm-mono-semibold">{t(vote.choice)}</Text>
        </StatusBox>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {formatPercentage(vote.weight, govTokenTotalSupply)}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {formatCoin(vote.weight, true, govTokenDecimals, govTokenSymbol)}
        </Text>
      </GridItem>
    </Grid>
  );
}

function ProposalVotes({
  proposal: {
    votesSummary: { yes, no, abstain },
    votes,
  },
  govTokenTotalSupply,
  govTokenDecimals,
  govTokenSymbol,
}: {
  proposal: Proposal;
  govTokenTotalSupply: BigNumber;
  govTokenDecimals: number;
  govTokenSymbol: string;
}) {
  const { t } = useTranslation(['common', 'proposal']);

  const yesVotesPercentage = yes.div(govTokenTotalSupply).mul(100).toNumber();
  const noVotesPercentage = no.div(govTokenTotalSupply).mul(100).toNumber();
  const abstainVotesPercentage = abstain.div(govTokenTotalSupply).mul(100).toNumber();

  return (
    <>
      <ContentBox bg="black.900-semi-transparent">
        <Text textStyle="text-lg-mono-medium">{t('breakdownTitle', { ns: 'proposal' })}</Text>
        <Grid
          templateColumns="repeat(5, 1fr)"
          gap={7}
        >
          <GridItem colSpan={1}>
            <CircularProgress
              color="drab.900"
              trackColor="drab.700"
              value={yesVotesPercentage}
              size="156px"
              marginTop={4}
            >
              <CircularProgressLabel>
                <Text
                  textStyle="text-lg-mono-regular"
                  color="grayscale.100"
                >
                  {yesVotesPercentage}%
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
              percentage={yesVotesPercentage}
            />
            <VotesPercentage
              label={t('no')}
              percentage={noVotesPercentage}
            />

            <VotesPercentage
              label={t('abstain')}
              percentage={abstainVotesPercentage}
            />
          </GridItem>
        </Grid>
      </ContentBox>
      <ContentBox bg="black.900-semi-transparent">
        <Text textStyle="text-lg-mono-medium">{t('votesTitle', { ns: 'proposal' })}</Text>
        <Divider
          color="chocolate.700"
          marginTop={4}
          marginBottom={4}
        />
        <Flex
          flexWrap="wrap"
          gap={4}
        >
          {votes.map(vote => (
            <ProposalVoteItem
              key={vote.voter}
              vote={vote}
              govTokenTotalSupply={govTokenTotalSupply}
              govTokenDecimals={govTokenDecimals}
              govTokenSymbol={govTokenSymbol}
            />
          ))}
        </Flex>
      </ContentBox>
    </>
  );
}

export default ProposalVotes;
