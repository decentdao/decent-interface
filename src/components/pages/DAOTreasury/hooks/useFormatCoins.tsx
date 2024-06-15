import { useEffect, useState } from 'react';
import { maxUint256, zeroAddress } from 'viem';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { formatCoin, formatUSD } from '../../../../utils/numberFormats';

export interface TokenDisplayData {
  iconUri: string;
  address: string;
  symbol: string;
  truncatedCoinTotal: string;
  fullCoinTotal: string;
  fiatValue: number;
  fiatDisplayValue: string;
  fiatConversion: string;
  rawValue: string;
}

export function useFormatCoins() {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { chain, nativeTokenIcon } = useNetworkConfig();
  const [totalFiatValue, setTotalFiatValue] = useState(0);
  const [displayData, setDisplayData] = useState<TokenDisplayData[]>([]);

  useEffect(() => {
    async function loadDisplayData() {
      let newTotalFiatValue = 0;
      let newDisplayData = [];
      for (let i = 0; i < assetsFungible.length; i++) {
        let asset = assetsFungible[i];
        if (asset.balance === '0') continue;
        let tokenFiatBalance = 0;
        if (asset.usdPrice && asset.balance) {
          try {
            const multiplicator = 10000;
            const tokenFiatBalanceBi =
              (BigInt(asset.balance) *
                BigInt(Math.round(parseFloat(asset.usdPrice.toFixed(5)) * multiplicator))) / // We'll be loosing precision with super small prices like for meme coins. But that shouldn't be awfully off
              10n ** BigInt(asset?.decimals || 18);
            tokenFiatBalance =
              tokenFiatBalanceBi >= maxUint256
                ? Number(tokenFiatBalanceBi / BigInt(multiplicator))
                : Number(tokenFiatBalanceBi) / multiplicator;
            newTotalFiatValue += tokenFiatBalance;
          } catch (e) {
            logError('Error while calculating token fiat balance', e);
          }
        }

        const formatted: TokenDisplayData = {
          iconUri: asset.logo || asset.thumbnail || '/images/coin-icon-default.svg',
          address: asset.tokenAddress === null ? zeroAddress : asset.tokenAddress,
          truncatedCoinTotal: formatCoin(
            asset.balance,
            true,
            Number(asset?.decimals || 18),
            asset.symbol,
            false,
          ),
          fiatValue: tokenFiatBalance,
          symbol: asset.symbol,
          fiatConversion: asset.usdPrice
            ? `1 ${asset.symbol} = ${formatUSD(asset.usdPrice)}`
            : 'N/A',
          fullCoinTotal: formatCoin(
            asset.balance,
            false,
            Number(asset?.decimals || 18),
            asset.symbol,
          ),
          fiatDisplayValue: formatUSD(tokenFiatBalance),
          rawValue: asset.balance,
        };
        newDisplayData.push(formatted);
      }
      // @todo - once we'll be fetching prices for the NFTs - also include them in the calculation
      newDisplayData.sort((a, b) => b.fiatValue - a.fiatValue); // sort by USD value
      setTotalFiatValue(newTotalFiatValue);
      setDisplayData(newDisplayData);
    }

    loadDisplayData();
  }, [assetsFungible, nativeTokenIcon, chain]);

  return {
    totalFiatValue,
    displayData,
  };
}
