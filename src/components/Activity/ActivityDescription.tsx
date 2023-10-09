import { Flex } from '@chakra-ui/react';
import { Activity, SnapshotProposal } from '../../types';
import SnapshotProposalDescription from '../Proposals/SnapshotProposalDetails/SnapshotProposalDescription';
import { ProposalTitle } from './ActivityDescriptionGovernance';
import { ActivityDescriptionTreasury } from './ActivityDescriptionTreasury';

interface IActivityDescription {
  activity: Activity;
  showFullSnapshotDescription?: boolean;
}

export function ActivityDescription({
  activity,
  showFullSnapshotDescription,
}: IActivityDescription) {
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
        <SnapshotProposalDescription
          truncate={!showFullSnapshotDescription}
          proposal={snapshotProposalActivity}
        />
      )}
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
