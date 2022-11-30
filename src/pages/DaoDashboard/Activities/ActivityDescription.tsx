import { Flex, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from '../../../types';
import { ActivityAddress } from './ActivityAddress';

function TransferDescription({ asset }: { asset: Activity }) {
  const { t } = useTranslation();

  const transferTypeStr = useMemo(() => {
    return asset.isDeposit ? t('receive') : t('send');
  }, [asset, t]);
  const transferDirStr = useMemo(() => {
    return asset.isDeposit ? t('from') : t('to');
  }, [asset, t]);

  if (!asset.transaction.transfers.length) {
    return null;
  }

  return (
    <>
      <Text>
        {transferTypeStr} {asset.transferAmountTotals.join(', ')} {transferDirStr}
      </Text>
      {asset.transferAddresses.length > 2 ? (
        <Text>{t('addresses', { numOfAddresses: asset.transferAddresses.length })}</Text>
      ) : (
        asset.transferAddresses.map((address, i, arr) => (
          <ActivityAddress
            key={address + i}
            address={address}
            addComma={i !== arr.length - 1}
          />
        ))
      )}
    </>
  );
}

export function ActivityDescription({ asset }: { asset: Activity }) {
  const { t } = useTranslation('dashboard');
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      flexWrap="wrap"
    >
      {!!asset.eventTransactionsCount && (
        <Text> {t('proposalDescription', { txCount: asset.eventTransactionsCount })}</Text>
      )}
      {!!asset.transaction.transfers.length && !!asset.eventTransactionsCount && (
        <Text> {t('to')} </Text>
      )}

      <TransferDescription asset={asset} />
    </Flex>
  );
}
