import { Box, Divider, HStack, Image, Text, Tooltip } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import coinDefault from '../../assets/images/coin-icon-default.svg';
import ethDefault from '../../assets/images/coin-icon-eth.svg';
import nftDefault from '../../assets/images/nft-image-default.svg';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../components/ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../components/ui/EtherscanLinkToken';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../providers/fractal/types';
import { formatPercentage, formatCoin, formatUSD } from '../../utils/numberFormats';

interface TokenDisplayData {
  iconUri: string;
  address: string;
  name: string;
  formattedTotal: string;
  symbol: string;
  fiatValue: number;
  fiatConversion: number;
}

/**
 * We need to iterate through the tokens to get a sum of total assets, so we take the
 * opportunity to also format some of the display data here, rather than inline with the
 * components.
 */
function formatCoins(assets: GnosisAssetFungible[]) {
  let totalFiatValue = 0;
  let displayData: TokenDisplayData[] = new Array(assets.length);
  for (let i = 0; i < assets.length; i++) {
    let asset = assets[i];
    totalFiatValue += Number(asset.fiatBalance);
    const formatted: TokenDisplayData = {
      iconUri: asset.token === null ? ethDefault : asset.token.logoUri,
      address: asset.tokenAddress === null ? ethers.constants.AddressZero : asset.tokenAddress,
      name: asset.token === null ? 'Ether' : asset.token.name,
      formattedTotal: formatCoin(asset.balance, true, asset?.token?.decimals, asset?.token?.symbol),
      fiatValue: Number(asset.fiatBalance),
      fiatConversion: Number(asset.fiatConversion),
      symbol: asset.token === null ? 'ETH' : asset.token.symbol,
    };
    displayData[i] = formatted;
  }
  displayData.sort((a, b) => b.fiatValue - a.fiatValue); // sort by USD value
  return {
    totalFiatValue: totalFiatValue,
    displayData: displayData,
  };
}

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
          variant="infoSmall"
        >
          {t('columnCoins')}
        </Text>
        <Text
          w="33%"
          variant="infoSmall"
        >
          {t('columnValue')}
        </Text>
        <Text
          w="33%"
          align="end"
          variant="infoSmall"
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
            fallbackSrc={coinDefault}
            alt={asset.name}
            w="0.83rem"
            h="0.83rem"
          />
          <Text
            height="auto"
            variant="infoRegular"
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
          variant="infoRegular"
          marginBottom="0.25rem"
        >
          {asset.formattedTotal}
        </Text>
        <Text variant="infoSmall">
          <Tooltip
            label={`1 ${asset.symbol} = ${formatUSD(asset.fiatConversion)}`}
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
            variant="infoRegular"
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
        variant="infoSmall"
        marginBottom="1rem"
      >
        {t('columnNFTs')}
      </Text>
    </Box>
  );
}

function NFTRow({ asset, isLast }: { asset: GnosisAssetNonFungible; isLast: boolean }) {
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
          fallbackSrc={nftDefault}
          alt={name}
          w="3rem"
          h="3rem"
          marginRight="0.75rem"
        />
      </EtherscanLinkNFT>
      <Text
        variant="infoRegular"
        data-testid="link-nft-name"
        noOfLines={1}
      >
        <EtherscanLinkAddress address={asset.address}>{name}</EtherscanLinkAddress>
      </Text>
      <Text
        variant="infoRegular"
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
    gnosis: { safe },
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();
  const { t } = useTranslation('treasury');
  const tokenDisplay = formatCoins(assetsFungible);
  return (
    <Box>
      {' '}
      <Text
        variant="infoSmall"
        marginTop="1.5rem"
        marginBottom="0.5rem"
      >
        {t('subtitleCoinBalance')}
      </Text>
      <Text
        data-testid="text-usd-total"
        variant="infoLarge"
      >
        {formatUSD(tokenDisplay.totalFiatValue)}
      </Text>
      {tokenDisplay.displayData.length > 0 && <CoinHeader />}
      {tokenDisplay.displayData.map(asset => {
        return (
          <CoinRow
            safe={safe.address!}
            totalFiat={tokenDisplay.totalFiatValue}
            key={asset.address}
            asset={asset}
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
