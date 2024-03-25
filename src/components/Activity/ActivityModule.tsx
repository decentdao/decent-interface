import { FractalProposal } from '../../types';
import { Badge } from '../ui/badges/Badge';
import EtherscanLinkTransaction from '../ui/links/EtherscanLinkTransaction';
import { ActivityCard } from './ActivityCard';
import { ActivityDescriptionModule } from './ActivityDescriptionModule';

export function ActivityModule({ activity }: { activity: FractalProposal }) {
  return (
    <EtherscanLinkTransaction txHash={activity.transactionHash}>
      <ActivityCard
        Badge={
          activity.state && (
            <Badge
              size="base"
              labelKey={activity.state}
            />
          )
        }
        description={<ActivityDescriptionModule activity={activity} />}
      />
    </EtherscanLinkTransaction>
  );
}
