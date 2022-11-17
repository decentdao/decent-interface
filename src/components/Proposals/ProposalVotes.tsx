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
import useDisplayName from '../../hooks/useDisplayName';
import { Proposal, ProposalVote } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';
import ProgressBar from '../ui/ProgressBar';

// @todo - get this data from strategy contract/gov token contract, update votes mapping
const MOCK_VOTES: ProposalVote[] = [
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29d',
    choice: 'no',
    weight: BigNumber.from(150),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29a',
    choice: 'yes',
    weight: BigNumber.from(2000),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29b',
    choice: 'yes',
    weight: BigNumber.from(100),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29c',
    choice: 'yes',
    weight: BigNumber.from(75),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29e',
    choice: 'abstain',
    weight: BigNumber.from(400),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29f',
    choice: 'no',
    weight: BigNumber.from(150),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29g',
    choice: 'yes',
    weight: BigNumber.from(150),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29k',
    choice: 'yes',
    weight: BigNumber.from(150),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29l',
    choice: 'yes',
    weight: BigNumber.from(150),
  },
  {
    voter: '0x6a0db4cef1ce2a5f81c8e6322862439f71aca29m',
    choice: 'no',
    weight: BigNumber.from(150),
  },
];

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
  govTokenSymbol,
}: {
  vote: ProposalVote;
  govTokenTotalSupply: BigNumber;
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
        <Box
          px="12px"
          py="5px"
          bg={vote.choice === 'yes' ? 'sand.700' : 'sand.800'}
          borderRadius="7px"
          color="black"
          display="inline-block"
        >
          <Text textStyle="text-sm-mono-semibold">{t(vote.choice)}</Text>
        </Box>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {vote.weight.div(govTokenTotalSupply).mul(100).toNumber()}%
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {vote.weight.toString()} {govTokenSymbol}
        </Text>
      </GridItem>
    </Grid>
  );
}

function ProposalVotes({
  proposal: {
    votes: { yes, no, abstain },
  },
  govTokenTotalSupply,
  govTokenSymbol,
}: {
  proposal: Proposal;
  govTokenTotalSupply: BigNumber;
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
          {MOCK_VOTES.map(vote => (
            <ProposalVoteItem
              key={vote.voter}
              vote={vote}
              govTokenTotalSupply={govTokenTotalSupply}
              govTokenSymbol={govTokenSymbol}
            />
          ))}
        </Flex>
      </ContentBox>
    </>
  );
}

export default ProposalVotes;
