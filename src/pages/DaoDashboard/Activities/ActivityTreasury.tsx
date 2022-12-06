import { Button } from '@chakra-ui/react';
import { SquareSolidArrowDown, ArrowAngleUp, SquareSolidArrowUp } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import EtherscanLinkAddress from '../../../components/ui/EtherscanLinkAddress';
import { TreasuryActivity } from '../../../types';
import { AcitivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityTreasury({ activity }: { activity: TreasuryActivity }) {
  const { t } = useTranslation();
  return (
    <AcitivityCard
      Badge={
        activity.isDeposit ? (
          <SquareSolidArrowDown color="sand.700" />
        ) : (
          <SquareSolidArrowUp color="sand.700" />
        )
      }
      description={<ActivityDescription activity={activity} />}
      RightElement={
        activity.transactionHash ? (
          <EtherscanLinkAddress
            path="tx"
            address={activity.transactionHash}
          >
            <Button
              variant="text"
              size="lg"
              px="0px"
              rightIcon={<ArrowAngleUp boxSize="1.5rem" />}
            >
              {t('labelEtherscan')}
            </Button>
          </EtherscanLinkAddress>
        ) : undefined
      }
      eventDate={activity.eventDate}
    />
  );
}
