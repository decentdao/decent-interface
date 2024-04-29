import { Grid, GridItem, Text, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  ExtendedSnapshotProposal,
  SnapshotVote,
  SnapshotWeightedVotingChoice,
} from '../../../types';
import StatusBox from '../../ui/badges/StatusBox';

interface ISnapshotProposalVoteItem {
  proposal: ExtendedSnapshotProposal;
  vote: SnapshotVote;
}

export default function SnapshotProposalVoteItem({ proposal, vote }: ISnapshotProposalVoteItem) {
  const { t } = useTranslation();
  const { displayName } = useDisplayName(vote.voter);
  const {
    readOnly: { user },
  } = useFractal();

  const isWeighted = proposal.type === 'weighted';

  return (
    <Grid
      templateColumns={isWeighted ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}
      width="100%"
    >
      <GridItem colSpan={1}>
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {displayName}
          {user.address === vote.voter && t('isMeSuffix')}
        </Text>
      </GridItem>
      <GridItem colSpan={isWeighted ? 2 : 1}>
        {isWeighted ? (
          <Flex
            gap={1}
            flexWrap="wrap"
          >
            {Object.keys(vote.choice as SnapshotWeightedVotingChoice).map((choiceIdx: any) => {
              if (!(vote.choice as SnapshotWeightedVotingChoice)[choiceIdx]) {
                return null;
              }
              return (
                <StatusBox key={choiceIdx}>
                  <Text
                    textStyle="body-base"
                    color="neutral-7"
                  >
                    {proposal.choices[(choiceIdx as number) - 1]}
                  </Text>
                </StatusBox>
              );
            })}
          </Flex>
        ) : (
          <StatusBox>
            <Text
              textStyle="body-base"
              color="neutral-7"
            >
              {proposal.choices[(vote.choice as number) - 1]}
            </Text>
          </StatusBox>
        )}
      </GridItem>
      <GridItem colSpan={1}>
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {vote.votingWeight} {proposal.strategies[0].params.symbol}
        </Text>
      </GridItem>
    </Grid>
  );
}
