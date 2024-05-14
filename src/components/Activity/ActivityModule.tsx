import { Link } from '@chakra-ui/react';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalProposal } from '../../types';
import { Badge } from '../ui/badges/Badge';
import { ActivityCard } from './ActivityCard';
import { ActivityDescriptionModule } from './ActivityDescriptionModule';

export function ActivityModule({ activity, ...rest }: { activity: FractalProposal }) {
  const { etherscanBaseURL } = useNetworkConfig();

  return (
    <Link
      _hover={{ textDecorationn: 'none' }}
      target="_blank"
      rel="noreferrer"
      href={`${etherscanBaseURL}/tx/${activity.transactionHash}`}
    >
      <ActivityCard
        Badge={
          activity.state && (
            <Badge
              size="base"
              labelKey={activity.state}
            />
          )
        }
        description={
          <ActivityDescriptionModule
            activity={activity}
            {...rest}
          />
        }
      />
    </Link>
  );
}
