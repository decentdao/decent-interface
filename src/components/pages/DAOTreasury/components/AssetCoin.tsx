import { Divider, HStack, Flex, Tooltip, Text, Image, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { formatUSD, formatPercentage } from '../../../../utils';
import EtherscanLink from '../../../ui/links/EtherscanLink';
import { TokenDisplayData } from '../hooks/useFormatCoins';

export function CoinHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box
      mb="1rem"
      minW="360px"
    >
      <Divider
        my="1rem"
        variant="darker"
      />
      <HStack px={{ base: '1rem', lg: '1.5rem' }}>
        <Text
          w="40%"
          textStyle="label-small"
          color="neutral-7"
        >
          {t('columnCoins')}
        </Text>
        <Text
          w="35%"
          textStyle="label-small"
          color="neutral-7"
        >
          {t('columnValue')}
        </Text>
        <Text
          w="25%"
          textStyle="label-small"
          color="neutral-7"
        >
          {t('columnAllocation')}
        </Text>
      </HStack>
    </Box>
  );
}

export function CoinRow({
  safe,
  totalFiat,
  asset,
}: {
  safe: string;
  totalFiat: number;
  asset: TokenDisplayData;
}) {
  return (
    <Flex
      my="0.5rem"
      justifyContent="space-between"
      px={{ base: '1rem', lg: '1.5rem' }}
      gap="1rem"
      minW="360px"
    >
      <Flex
        w="40%"
        alignItems="center"
        gap="0.5rem"
      >
        <Image
          src={asset.iconUri}
          fallbackSrc="/images/coin-icon-default.svg"
          alt={asset.symbol}
          w="1rem"
          h="1rem"
        />
        <EtherscanLink
          color="white-0"
          _hover={{ bg: 'transparent' }}
          textStyle="body-base"
          padding={0}
          borderWidth={0}
          value={asset.address === zeroAddress ? safe : asset.address}
          type="token"
          wordBreak="break-word"
        >
          {asset.symbol}
        </EtherscanLink>
      </Flex>
      <Flex
        w="35%"
        alignItems="flex-start"
        flexWrap="wrap"
      >
        <Text
          maxWidth="23.8rem"
          width="100%"
          isTruncated
        >
          <Tooltip
            label={asset.fullCoinTotal}
            placement="top-start"
          >
            {asset.truncatedCoinTotal}
          </Tooltip>
        </Text>
        <Text
          textStyle="label-small"
          color="neutral-7"
          width="100%"
        >
          <Tooltip
            label={asset.fiatConversion}
            placement="top-start"
          >
            {formatUSD(asset.fiatValue)}
          </Tooltip>
        </Text>
      </Flex>
      <Flex
        w="25%"
        alignItems="flex-start"
      >
        <Text>{totalFiat > 0 && formatPercentage(asset.fiatValue, totalFiat)}</Text>
      </Flex>
    </Flex>
  );
}
