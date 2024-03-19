import { Box, Flex } from '@chakra-ui/react';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import { Activity, FractalProposal, SnapshotProposal } from '../../types';
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
  const description = snapshotProposal.description || metaData.description;

  return (
    <Flex
      gap="0.5rem"
      mr="1rem"
      mt="0.5rem"
      flexWrap="wrap"
    >
      <ProposalTitle activity={activity} />
      {description && (
        <Box
          minWidth="100%"
        >
          <Markdown
            content={description}
            truncate={!showFullDescription}
            isSubDescription={!showFullDescription}
            collapsedLines={3}
          />
        </Box>
      )}
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
