import { Box, Flex } from '@chakra-ui/react';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import useDisplayName from '../../hooks/utils/useDisplayName';
import {
  Activity,
  AzoriusProposal,
  FractalProposal,
  MultisigProposal,
  SnapshotProposal,
} from '../../types';
import Avatar from '../ui/page/Header/Avatar';
import Markdown from '../ui/proposal/Markdown';
import { ProposalTitle } from './ActivityDescriptionGovernance';
import { ActivityDescriptionTreasury } from './ActivityDescriptionTreasury';

interface IActivityDescription {
  activity: Activity;
  showFullDescription?: boolean;
}

export function ActivityDescription({ activity, showFullDescription }: IActivityDescription) {
  const metaData = useGetMetadata(activity as FractalProposal);

  const snapshotProposal = activity as SnapshotProposal;
  const azoriusProposal = activity as AzoriusProposal;
  const multisigProposal = activity as MultisigProposal;

  const description = snapshotProposal.description || metaData.description;
  const isSnapshotProposal = !!snapshotProposal.snapshotProposalId;
  const isAzoriusProposal = !!azoriusProposal.proposer;

  const proposer = isAzoriusProposal
    ? azoriusProposal.proposer
    : isSnapshotProposal
      ? snapshotProposal.author
      : multisigProposal.confirmations[0].owner;

  const { displayName: author } = useDisplayName(proposer);
  return (
    <Flex
      gap="0.5rem"
      mr="1rem"
      mt="0.5rem"
      flexWrap="wrap"
    >
      <ProposalTitle activity={activity} />
      <Flex
        gap={2}
        alignItems="center"
        color="#B3B3B3"
        textStyle="text-md-sans-regular"
      >
        <Avatar
          size="sm"
          address={author}
        />
        <Box>{author}</Box>
      </Flex>
      {description && (
        <Box
          minWidth="100%"
          textColor="#B3B3B3"
        >
          <Markdown
            content={description}
            truncate={!showFullDescription}
            collapsedLines={3}
          />
        </Box>
      )}
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
