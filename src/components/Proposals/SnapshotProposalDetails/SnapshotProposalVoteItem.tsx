import { Grid, GridItem, Text, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useSnapshotProposal from '../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
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
  const { getVoteWeight } = useSnapshotProposal(proposal);
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
        <Text textStyle="text-base-sans-regular">
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
            {Object.keys(vote.choice as SnapshotWeightedVotingChoice).map((choice: any) => {
              return (
                <StatusBox key={choice}>
                  <Text textStyle="text-sm-mono-semibold">
                    {proposal.choices[(choice as any as number) - 1]}
                  </Text>
                </StatusBox>
              );
            })}
          </Flex>
        ) : (
          <StatusBox>
            <Text textStyle="text-sm-mono-semibold">{vote.choice as string}</Text>
          </StatusBox>
        )}
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {getVoteWeight(vote)} {proposal.strategies[0].params.symbol}
        </Text>
      </GridItem>
    </Grid>
  );
}
