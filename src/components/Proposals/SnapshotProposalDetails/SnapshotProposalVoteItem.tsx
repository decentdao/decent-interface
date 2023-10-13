import { Grid, GridItem, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { ExtendedSnapshotProposal, SnapshotVote } from '../../../types';
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
  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      width="100%"
    >
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {displayName}
          {user.address === vote.voter && t('isMeSuffix')}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <StatusBox>
          <Text textStyle="text-sm-mono-semibold">{vote.choice}</Text>
        </StatusBox>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {vote.votingWeight} {proposal.strategies[0].params.symbol}
        </Text>
      </GridItem>
    </Grid>
  );
}
