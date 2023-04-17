import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

export function DisplayAddress({ address }: { address: string }) {
  const displayAddress = useDisplayName(address);
  const { t } = useTranslation();
  return (
    <EtherscanLinkAddress address={address}>
      <Tooltip
        label={t('etherscanTip')}
        placement="bottom"
      >
        <HStack
          color="gold.500"
          textStyle="text-base-sm-regular"
        >
          <Text>{displayAddress.displayName}</Text>
          <ArrowAngleUp />
        </HStack>
      </Tooltip>
    </EtherscanLinkAddress>
  );
}
