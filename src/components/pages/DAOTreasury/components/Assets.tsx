import { Box, Divider, HStack, Image, Text, Tooltip } from '@chakra-ui/react';
import { SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { formatPercentage, formatUSD } from '../../../../utils/numberFormats';
import EtherscanLinkAddress from '../../../ui/links/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../../ui/links/EtherscanLinkNFT';
import EtherscanLinkToken from '../../../ui/links/EtherscanLinkToken';
import { TokenDisplayData, useFormatCoins } from '../hooks/useFormatCoins';

function CoinHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box>
      <Divider
        color="chocolate.700"
        marginTop="1.5rem"
        marginBottom="1.5rem"
      />
      <HStack marginBottom="0.5rem">
        <Text
          w="33%"
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('columnCoins')}
        </Text>
        <Text
          w="33%"
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('columnValue')}
        </Text>
        <Text
          w="33%"
          align="end"
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('columnAllocation')}
        </Text>
      </HStack>
    </Box>
  );
}

function CoinRow({
  safe,
  totalFiat,
  asset,
}: {
  safe: string;
  totalFiat: number;
  asset: TokenDisplayData;
}) {
  return (
    <HStack
      align="top"
      marginBottom="0.75rem"
    >
      <Box w="33%">
        <HStack marginEnd="1rem">
          <Image
            src={asset.iconUri}
            fallbackSrc="/images/coin-icon-default.svg"
            alt={asset.symbol}
            w="1rem"
            h="1rem"
          />
          <Text
            height="auto"
            textStyle="text-base-sans-regular"
            color="grayscale.100"
            data-testid="link-token-symbol"
            noOfLines={2}
          >
            {asset.address === ethers.constants.AddressZero ? (
              <EtherscanLinkAddress address={safe}>{asset.symbol}</EtherscanLinkAddress>
            ) : (
              <EtherscanLinkToken address={asset.address}>{asset.symbol}</EtherscanLinkToken>
            )}
          </Text>
        </HStack>
      </Box>
      <Box w="37%">
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
          marginBottom="0.25rem"
        >
          <Tooltip
            label={asset.fullCoinTotal}
            placement="top-start"
          >
            {asset.truncatedCoinTotal}
          </Tooltip>
        </Text>
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          <Tooltip
            label={asset.fiatConversion}
            placement="top-start"
          >
            {formatUSD(asset.fiatValue)}
          </Tooltip>
        </Text>
      </Box>
      <Box w="30%">
        {asset.fiatValue / totalFiat > 0.0001 && (
          <Text
            align="end"
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {formatPercentage(asset.fiatValue, totalFiat)}
          </Text>
        )}
      </Box>
    </HStack>
  );
}

function NFTHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box>
      <Divider
        color="chocolate.700"
        marginTop="0.75rem"
        marginBottom="1.5rem"
      />
      <Text
        w="33%"
        textStyle="text-sm-sans-regular"
        color="chocolate.200"
        marginBottom="1rem"
      >
        {t('columnNFTs')}
      </Text>
    </Box>
  );
}

function NFTRow({ asset, isLast }: { asset: SafeCollectibleResponse; isLast: boolean }) {
  const image = asset.imageUri ? asset.imageUri : asset.logoUri;
  const name = asset.name ? asset.name : asset.tokenName;
  const id = asset.id.toString();
  return (
    <HStack marginBottom={isLast ? '0rem' : '1.5rem'}>
      <EtherscanLinkNFT
        address={asset.address}
        tokenId={id}
        data-testid="link-nft-image"
      >
        <Image
          src={image}
          fallbackSrc="/images/nft-image-default.svg"
          alt={name}
          w="3rem"
          h="3rem"
          marginRight="0.75rem"
        />
      </EtherscanLinkNFT>
      <Text
        textStyle="text-base-sans-regular"
        color="grayscale.100"
        data-testid="link-nft-name"
        noOfLines={1}
      >
        <EtherscanLinkAddress address={asset.address}>{name}</EtherscanLinkAddress>
      </Text>
      <Text
        textStyle="text-base-sans-regular"
        color="grayscale.100"
        data-testid="link-nft-id"
        maxWidth="5rem"
        noOfLines={1}
      >
        <EtherscanLinkNFT
          address={asset.address}
          tokenId={id}
        >
          #{id}
        </EtherscanLinkNFT>
      </Text>
    </HStack>
  );
}

export function Assets() {
  const {
    node: { daoAddress },
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();
  const { t } = useTranslation('treasury');
  const coinDisplay = useFormatCoins(assetsFungible);
  return (
    <Box>
      <Text
        textStyle="text-sm-sans-regular"
        color="chocolate.200"
        marginTop="1.5rem"
        marginBottom="0.5rem"
      >
        {t('subtitleCoinBalance')}
      </Text>
      <Text
        data-testid="text-usd-total"
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
      >
        {formatUSD(coinDisplay.totalFiatValue)}
      </Text>
      {coinDisplay.displayData.length > 0 && <CoinHeader />}
      {coinDisplay.displayData.map(coin => {
        return (
          <CoinRow
            key={coin.address}
            safe={daoAddress!}
            totalFiat={coinDisplay.totalFiatValue}
            asset={coin}
          />
        );
      })}
      {assetsNonFungible.length > 0 && <NFTHeader />}
      {assetsNonFungible.map(asset => (
        <NFTRow
          key={asset.id}
          asset={asset}
          isLast={assetsNonFungible[assetsNonFungible.length - 1] === asset}
        />
      ))}
    </Box>
  );
}
