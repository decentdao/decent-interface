import { Button } from '@chakra-ui/react';
import { SquareSolidArrowDown, ArrowAngleUp, SquareSolidArrowUp } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import EtherscanLinkAddress from '../../../components/ui/EtherscanLinkAddress';
import { Activity } from '../../../types';
import { AcitivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

interface IActivityTreasury {
  asset: Activity;
}

export function ActivityTreasury({ asset }: IActivityTreasury) {
  const { t } = useTranslation();
  return (
    <AcitivityCard
      Badge={
        asset.isDeposit ? (
          <SquareSolidArrowDown color="sand.700" />
        ) : (
          <SquareSolidArrowUp color="sand.700" />
        )
      }
      description={<ActivityDescription asset={asset} />}
      RightElement={
        asset.eventTxHash ? (
          <EtherscanLinkAddress
            path="tx"
            address={asset.eventTxHash}
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
      eventDate={asset.eventDate}
    />
  );
}
