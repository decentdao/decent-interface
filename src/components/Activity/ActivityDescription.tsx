import { Flex, Text } from '@chakra-ui/react';
import { Activity, SnapshotProposal } from '../../types';
import { ProposalTitle } from './ActivityDescriptionGovernance';
import { ActivityDescriptionTreasury } from './ActivityDescriptionTreasury';

export function ActivityDescription({ activity }: { activity: Activity }) {
  const snapshotProposalActivity = activity as SnapshotProposal;
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      mr="1rem"
      flexWrap="wrap"
    >
      <ProposalTitle activity={activity} />
      {!!snapshotProposalActivity.snapshotProposalId && (
        <Text
          noOfLines={2}
          fontWeight={400}
        >
          {snapshotProposalActivity.description}
        </Text>
      )}
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
