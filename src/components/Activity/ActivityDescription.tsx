import { Flex } from '@chakra-ui/react';
import { Activity } from '../../types';

import { ProposalTitle } from './ActivityDescriptionGovernance';
import { ActivityDescriptionTreasury } from './ActivityDescriptionTreasury';

export function ActivityDescription({ activity }: { activity: Activity }) {
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      mr="1rem"
      flexWrap="wrap"
    >
      <ProposalTitle activity={activity} />
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
