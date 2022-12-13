import { Flex } from '@chakra-ui/react';
import { Activity } from '../../providers/Fractal/types';

import { ActivityDescriptionGovernance } from './ActivityDescriptionGovernance';
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
      <ActivityDescriptionGovernance activity={activity} />
      {!!activity.transaction && <ActivityDescriptionTreasury activity={activity} />}
    </Flex>
  );
}
