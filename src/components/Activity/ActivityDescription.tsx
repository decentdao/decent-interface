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
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      mr="1rem"
      flexWrap="wrap"
    >
      <ProposalTitle activity={activity} />
      {snapshotProposal.description ||
        (metaData.description && (
          <Box my={4}>
            <Markdown
              content={snapshotProposal.description || metaData.description}
              truncate={!showFullDescription}
            />
          </Box>
        ))}
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
