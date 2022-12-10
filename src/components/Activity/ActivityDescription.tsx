import { Flex } from '@chakra-ui/react';
import { Activity, GovernanceActivity } from '../../providers/Fractal/types';

import { ActivityDescriptionGovernance } from './ActivityDescriptionGovernance';
import { ActivityDescriptionTreasury } from './ActivityDescriptionTreasury';

export function ActivityDescription({ activity }: { activity: Activity }) {
  const governanceActivity = activity as GovernanceActivity;
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      mr="1rem"
      flexWrap="wrap"
    >
      <ActivityDescriptionGovernance activity={governanceActivity} />
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
