import { Box, Divider, HStack, Image, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../components/ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../components/ui/EtherscanLinkToken';
import TooltipWrapper from '../../components/ui/TooltipWrapper';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../providers/fractal/types';
import { formatPercentage, coinFormatter, usdFormatter } from '../../utils/numberFormats';

//
// TODO:
// 1. token image fallbackSrc
// 2. NFT image fallbackSrc
// 3. Empty states (design input needed)
// 4. are we adding white borders around all NFT image?
// 5. center align token image with text...

interface TokenDisplayData {
  iconUrl: string;
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
function formatTokens(assets: GnosisAssetFungible[]) {
  let totalFiatValue = 0;
  let displayData: TokenDisplayData[] = new Array(assets.length);
  for (let i = 0; i < assets.length; i++) {
    let asset = assets[i];
    totalFiatValue += Number(asset.fiatBalance);
    const formatted: TokenDisplayData = {
      iconUrl: asset.token === null ? '' : asset.token.logoUri,
      address: asset.tokenAddress === null ? ethers.constants.AddressZero : asset.tokenAddress,
      name: asset.token === null ? 'Ether' : asset.token.name,
      formattedTotal: coinFormatter(asset.balance, asset?.token?.decimals, asset?.token?.symbol),
      fiatValue: Number(asset.fiatBalance),
      fiatConversion: Number(asset.fiatConversion),
      symbol: asset.token === null ? 'ETH' : asset.token.symbol,
    };
    displayData[i] = formatted;
  }
  displayData.sort((a, b) => b.fiatValue - a.fiatValue);
  return {
    totalFiatValue: totalFiatValue,
    displayData: displayData,
  };
}

function TokenHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box>
      <Divider
        color="chocolate.700"
        marginTop="1.5rem"
        marginBottom="1.5rem"
      />
      <HStack marginBottom="1rem">
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

function TokenRow({
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
      <HStack
        align="top"
        w="33%"
      >
        <Image
          src={asset.iconUrl}
          fallbackSrc="https://safe-transaction-assets.safe.global/tokens/logos/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85.png"
          w="0.83rem"
          h="0.83rem"
          alt={asset.name}
        />
        <Text
          height="auto"
          variant="infoRegular"
          data-testid="link-token-name"
        >
          {asset.address === ethers.constants.AddressZero ? (
            <EtherscanLinkAddress address={safe}>{asset.name}</EtherscanLinkAddress>
          ) : (
            <EtherscanLinkToken address={asset.address}>{asset.name}</EtherscanLinkToken>
          )}
        </Text>
      </HStack>
      <Box w="33%">
        <Text
          variant="infoRegular"
          marginBottom="0.25rem"
        >
          {asset.formattedTotal}
        </Text>
        <Text variant="infoSmall">
          <TooltipWrapper
            content={`1 ${asset.symbol} = ${usdFormatter.format(asset.fiatConversion)}`}
            isVisible
            placement="top-start"
          >
            {usdFormatter.format(asset.fiatValue)}
          </TooltipWrapper>
        </Text>
      </Box>
      <Box w="33%">
        {asset.fiatValue > 0 && (
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
        marginBottom="0.5rem"
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
  const name = asset.name ? asset.name : asset.tokenSymbol;
  const id = asset.id.toString();
  return (
    <HStack marginBottom={isLast ? '0rem' : '1.5rem'}>
      <Image
        src={image}
        fallbackSrc="https://maneki-gang.s3.amazonaws.com/thumbs/1b4c08fc0db5c607.png"
        w="3rem"
        h="3rem"
        alt={name}
        marginRight="0.75rem"
      />
      <Text
        variant="infoRegular"
        data-testid="link-nft-name"
      >
        <EtherscanLinkAddress address={asset.address}>{name}</EtherscanLinkAddress>
      </Text>
      <Text
        variant="infoRegular"
        data-testid="link-nft-id"
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
  const tokenDisplay = formatTokens(assetsFungible);
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
      <Text variant="infoLarge">{usdFormatter.format(tokenDisplay.totalFiatValue)}</Text>
      {tokenDisplay.displayData.length > 0 && <TokenHeader />}
      {tokenDisplay.displayData.map(asset => {
        return (
          <TokenRow
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
