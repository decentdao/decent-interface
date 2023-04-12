import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import EtherscanTransactionLink from './EtherscanTransactionLink';

export default function DisplayTransaction({ txHash }: { txHash: string }) {
  const displayName = createAccountSubstring(txHash);
  const { t } = useTranslation();
  return (
    <EtherscanTransactionLink txHash={txHash}>
      <Tooltip
        label={t('etherscanTip')}
        placement="bottom"
      >
        <HStack
          color="gold.500"
          textStyle="text-base-sm-regular"
        >
          <Text>{displayName}</Text>
          <ArrowAngleUp />
        </HStack>
      </Tooltip>
    </EtherscanTransactionLink>
  );
}
