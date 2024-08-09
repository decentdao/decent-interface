import { Button, Icon } from '@chakra-ui/react';
import { ArrowUp, ArrowDown, ArrowUpRight } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { TreasuryActivity, ActivityEventType } from '../../types';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import EtherscanLink from '../ui/links/EtherscanLink';
import { ActivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityTreasury({ activity }: { activity: TreasuryActivity }) {
  const { t } = useTranslation();
  const {
    node: { safe },
  } = useFractal();

  const daoAddress = safe?.address;

  const eventDateLabel = t(
    activity.eventType === ActivityEventType.Treasury
      ? activity.transaction?.to === daoAddress
        ? 'received'
        : 'sent'
      : 'created',
  );

  return (
    <ActivityCard
      Badge={
        <Icon
          as={activity.isDeposit ? ArrowUp : ArrowDown}
          w="1.25rem"
          h="1.25rem"
          color="neutral-7"
        />
      }
      description={<ActivityDescription activity={activity} />}
      RightElement={
        activity.transactionHash ? (
          <EtherscanLink
            type="tx"
            value={activity.transactionHash}
          >
            <Button
              variant="text"
              size="sm"
              _hover={{ color: 'celery-0' }}
              rightIcon={<ArrowUpRight />}
            >
              {t('labelEtherscan')}
            </Button>
          </EtherscanLink>
        ) : undefined
      }
      eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
      eventDateLabel={eventDateLabel}
    />
  );
}
