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
import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  AzoriusProposal,
  GovernanceType,
  ERC721ProposalVote,
} from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import ProgressBar from '../../ui/utils/ProgressBar';
import ProposalERC20VoteItem from './ProposalERC20VoteItem';
import ProposalERC721VoteItem from './ProposalERC721VoteItem';

export function VotesPercentage({
  label,
  percentage,
  children,
}: {
  label: string;
  percentage: number;
  children?: ReactNode;
}) {
  return (
    <Flex
      flexWrap="wrap"
      marginTop={2}
    >
      <ProgressBar value={percentage}>
        <Flex
          justifyContent="space-between"
          width="100%"
        >
          <Text
            marginTop={2}
            marginBottom={2}
          >
            {label}
          </Text>
          {children}
        </Flex>
      </ProgressBar>
    </Flex>
  );
}

function ProposalVotes({
  proposal: {
    proposalId,
    votesSummary: { yes, no, abstain },
    votes,
  },
}: {
  proposal: AzoriusProposal;
}) {
  const { governance } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { t } = useTranslation(['common', 'proposal']);
  const totalVotesCasted = useMemo(() => yes.add(no).add(abstain), [yes, no, abstain]);

  const isERC20 = useMemo(
    () => azoriusGovernance.type === GovernanceType.AZORIUS_ERC20,
    [azoriusGovernance.type],
  );
  const isERC721 = useMemo(
    () => azoriusGovernance.type === GovernanceType.AZORIUS_ERC721,
    [azoriusGovernance.type],
  );

  const getVotesPercentage = useCallback(
    (voteTotal: BigNumber): number => {
      if (totalVotesCasted.eq(0)) {
        return 0;
      }
      return voteTotal.mul(100).div(totalVotesCasted).toNumber();
    },
    [totalVotesCasted],
  );

  if ((isERC20 && !azoriusGovernance.votesToken) || (isERC721 && !azoriusGovernance.erc721Tokens)) {
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
      <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
        <Text textStyle="text-lg-mono-medium">{t('breakdownTitle', { ns: 'proposal' })}</Text>
        <Grid
          templateColumns={{ base: 'repeat(2, 1ft)', md: 'repeat(5, 1fr)' }}
          gap={7}
        >
          <GridItem
            colSpan={{ base: 4, md: 1 }}
            justifyContent="center"
            mx="auto"
          >
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
        <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
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
            {votes.map(vote => {
              if (isERC20) {
                return (
                  <ProposalERC20VoteItem
                    key={vote.voter}
                    vote={vote}
                    govTokenTotalSupply={
                      azoriusGovernance.votesToken?.totalSupply || BigNumber.from(0)
                    }
                    govTokenDecimals={azoriusGovernance.votesToken?.decimals || 0}
                    govTokenSymbol={azoriusGovernance.votesToken?.symbol || ''}
                  />
                );
              } else if (isERC721) {
                return (
                  <ProposalERC721VoteItem
                    key={vote.voter}
                    vote={vote as ERC721ProposalVote}
                    proposalId={proposalId}
                  />
                );
              } else {
                return null;
              }
            })}
          </Flex>
        </ContentBox>
      )}
    </>
  );
}

export default ProposalVotes;
