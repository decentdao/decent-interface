import { Button, Flex, Text } from '@chakra-ui/react';
import { SquareSolidArrowDown, ArrowAngleUp, SquareSolidArrowUp } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import EtherscanLinkAddress from '../../../components/ui/EtherscanLinkAddress';
import { AcitivityCard } from './ActivityCard';
import { Activity, TreasuryAcitivityTypes } from './hooks/useActivities';

function ActivityDescription({
  transferTypeStr,
  transferDirStr,
  totalAmounts,
  transferAddresses,
}: {
  transferTypeStr: string;
  transferDirStr: string;
  totalAmounts: string[];
  transferAddresses: string[];
}) {
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
    >
      <Text>{transferTypeStr}</Text>
      <Text>{totalAmounts.join(', ')}</Text>
      <Text>{transferDirStr}</Text>
      {transferAddresses.length > 2 ? (
        <Text
          color="grayscale.100"
          textStyle="text-lg-mono-semibold"
        >
          {transferAddresses.length} addresses
        </Text>
      ) : (
        <Text
          color="grayscale.100"
          textStyle="text-lg-mono-semibold"
        >
          {transferAddresses.join()}
        </Text>
      )}
    </Flex>
  );
}

interface IActivityTreasury {
  asset: Activity;
}

export function ActivityTreasury({ asset }: IActivityTreasury) {
  const transferTypeStr = useMemo(() => {
    return asset.isDeposit ? 'Recieved' : 'Sent';
  }, [asset]);
  const transferDirStr = useMemo(() => {
    return asset.isDeposit ? 'from' : 'to';
  }, [asset]);

  return (
    <AcitivityCard
      Badge={
        asset.treasuryActivityType === TreasuryAcitivityTypes.DEPOSIT ? (
          <SquareSolidArrowDown color="sand.700" />
        ) : (
          <SquareSolidArrowUp color="sand.700" />
        )
      }
      description={
        <ActivityDescription
          transferAddresses={asset.transferAddresses}
          transferTypeStr={transferTypeStr}
          transferDirStr={transferDirStr}
          totalAmounts={asset.transferAmountTotals}
        />
      }
      RightElement={
        <EtherscanLinkAddress>
          <Button
            variant="text"
            size="lg"
            px="0px"
            rightIcon={<ArrowAngleUp boxSize="1.5rem" />}
          >
            View on Etherscan
          </Button>
        </EtherscanLinkAddress>
      }
      eventDate={asset.eventDate}
    />
  );
}
