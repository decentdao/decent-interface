import {
  Box,
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
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useDisplayName from '../../hooks/utils/useDisplayName';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { ProposalVote, UsulProposal } from '../../providers/Fractal/types';
import { formatCoin, formatPercentage } from '../../utils/numberFormats';
import StatusBox from '../ui/badges/StatusBox';
import ContentBox from '../ui/containers/ContentBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProgressBar from '../ui/utils/ProgressBar';

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
}: {
  proposal: UsulProposal;
}) {
  const {
    governance: { governanceToken },
  } = useFractal();
  const { t } = useTranslation(['common', 'proposal']);
  const totalVotesCasted = yes.add(no).add(abstain);

  const getVotesPercentage = (voteTotal: BigNumber): number => {
    if (totalVotesCasted.eq(0)) {
      return 0;
    }

    return voteTotal.div(totalVotesCasted.div(100)).toNumber();
  };

  if (!governanceToken || !governanceToken.totalSupply) {
    return (
      <Box mt={4}>
        <InfoBoxLoader />
      </Box>
    );
  }

  const yesVotesPercentage = getVotesPercentage(yes);
  const noVotesPercentage = getVotesPercentage(no);
  const abstainVotesPercentage = getVotesPercentage(abstain);

  return (
    <>
      <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
        <Text textStyle="text-lg-mono-medium">{t('breakdownTitle', { ns: 'proposal' })}</Text>
        <Grid
          templateColumns="repeat(5, 1fr)"
          gap={7}
        >
          <GridItem colSpan={1}>
            <CircularProgress
              color="drab.900"
              trackColor="drab.700"
              value={Math.min(yesVotesPercentage, 100)}
              size="156px"
              marginTop={4}
            >
              <CircularProgressLabel>
                <Text
                  textStyle="text-lg-mono-regular"
                  color="grayscale.100"
                >
                  {Math.min(yesVotesPercentage, 100)}%
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
      {votes.length !== 0 && (
        <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
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
                govTokenTotalSupply={governanceToken.totalSupply!}
                govTokenDecimals={governanceToken.decimals!}
                govTokenSymbol={governanceToken.symbol!}
              />
            ))}
          </Flex>
        </ContentBox>
      )}
    </>
  );
}

export default ProposalVotes;
