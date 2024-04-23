import { Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { ExtendedSnapshotProposal, FractalProposalState } from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import { ProposalCountdown } from '../../ui/proposal/ProposalCountdown';
import Divider from '../../ui/utils/Divider';
import { VotesPercentage } from '../ProposalVotes';
import SnapshotProposalVoteItem from './SnapshotProposalVoteItem';
import useTotalVotes from './hooks/useTotalVotes';

interface ISnapshotProposalVotes {
  proposal: ExtendedSnapshotProposal;
}

export default function SnapshotProposalVotes({ proposal }: ISnapshotProposalVotes) {
  const { t } = useTranslation('proposal');
  const { totalVotesCasted } = useTotalVotes({ proposal });
  const { votes, votesBreakdown, choices, strategies, privacy, state, type } = proposal;
  const strategySymbol = strategies[0].params.symbol;

  return (
    <>
      <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
        <Flex justifyContent="space-between">
          <Text textStyle="text-lg-mono-medium">{t('breakdownTitle')}</Text>
          <Flex>
            <Text
              color="chocolate.200"
              textStyle="text-md-mono-semibold"
            >
              {t('totalVotes')}
            </Text>
            <Text
              ml={1}
              textStyle="text-md-mono-semibold"
            >
              {totalVotesCasted} {strategySymbol}
            </Text>
          </Flex>
        </Flex>
        <Grid>
          <GridItem
            colSpan={4}
            rowGap={4}
          >
            {choices.map((choice, i) => {
              const votesBreakdownChoice =
                type === 'weighted' ? votesBreakdown[i + 1] : votesBreakdown[choice];
              const votesBreakdownChoiceTotal =
                votesBreakdownChoice && votesBreakdownChoice?.total
                  ? votesBreakdownChoice?.total
                  : 0;
              const choicePercentageFromTotal =
                (votesBreakdownChoiceTotal * 100) / totalVotesCasted;

              return (
                <VotesPercentage
                  key={choice}
                  label={choice}
                  percentage={Number(choicePercentageFromTotal.toFixed(1))}
                >
                  <Text>
                    {proposal.privacy === 'shutter' &&
                    proposal.state !== FractalProposalState.CLOSED
                      ? `? ${strategySymbol}`
                      : `${votesBreakdownChoiceTotal.toFixed(2)} ${strategySymbol}`}
                  </Text>
                </VotesPercentage>
              );
            })}
          </GridItem>
        </Grid>
      </ContentBox>
      {votes && votes.length !== 0 && (
        <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
          <Text textStyle="text-lg-mono-medium">
            {t('votesTitle')} ({votes.length})
          </Text>
          <Divider
            my={4}
          />
          <Flex
            flexWrap="wrap"
            gap={4}
          >
            {privacy === 'shutter' && state !== FractalProposalState.CLOSED ? (
              <Flex
                justifyContent="center"
                width="100%"
              >
                <Text
                  color="chocolate.200"
                  textStyle="text-base-mono-semibold"
                >
                  {t('shutterVotesHidden')} |
                </Text>
                <ProposalCountdown
                  proposal={proposal}
                  showIcon={false}
                />
              </Flex>
            ) : (
              votes.map(vote => (
                <SnapshotProposalVoteItem
                  key={vote.voter}
                  vote={vote}
                  proposal={proposal}
                />
              ))
            )}
          </Flex>
        </ContentBox>
      )}
    </>
  );
}
