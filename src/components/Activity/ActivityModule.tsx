import { Button } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { FractalProposal } from '../../types';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import { Badge } from '../ui/badges/Badge';
import EtherscanLinkTransaction from '../ui/links/EtherscanLinkTransaction';
import { ActivityCard } from './ActivityCard';
import { ActivityDescriptionModule } from './ActivityDescriptionModule';

export function ActivityModule({ activity }: { activity: FractalProposal }) {
  const { t } = useTranslation('common');
  return (
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
      RightElement={
        !!activity.transactionHash && (
          <EtherscanLinkTransaction txHash={activity.transactionHash}>
            <Button
              variant="text"
              size="lg"
              px="0px"
              rightIcon={<ArrowAngleUp boxSize="1.5rem" />}
            >
              {t('labelEtherscan')}
            </Button>
          </EtherscanLinkTransaction>
        )
      }
      eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
    />
  );
}
