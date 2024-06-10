import { useEffect, useState } from 'react';
import { maxUint256, zeroAddress } from 'viem';
import { logError } from '../../../../helpers/errorLogging';
import usePriceAPI from '../../../../providers/App/hooks/usePriceAPI';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { TokenBalance } from '../../../../types';
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

export function useFormatCoins(assets: TokenBalance[]) {
  const { chain, nativeTokenIcon } = useNetworkConfig();
  const [totalFiatValue, setTotalFiatValue] = useState(0);
  const [displayData, setDisplayData] = useState<TokenDisplayData[]>([]);
  const { getTokenPrices } = usePriceAPI();

  useEffect(() => {
    async function loadDisplayData() {
      let newTotalFiatValue = 0;
      let newDisplayData = [];
      const tokenPrices = await getTokenPrices(assets);
      for (let i = 0; i < assets.length; i++) {
        let asset = assets[i];
        if (asset.balance === '0') continue;
        const tokenPrice = tokenPrices
          ? asset.tokenAddress
            ? tokenPrices[asset.tokenAddress.toLowerCase()]
            : tokenPrices.ethereum
          : 0;

        let tokenFiatBalance = 0;
        if (tokenPrice && asset.balance) {
          try {
            const multiplicator = 10000;
            const tokenFiatBalanceBi =
              (BigInt(asset.balance) *
                BigInt(Math.round(parseFloat(tokenPrice.toFixed(5)) * multiplicator))) / // We'll be loosing precision with super small prices like for meme coins. But that shouldn't be awfully off
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

        let symbol = asset.symbol;
        const formatted: TokenDisplayData = {
          iconUri:
            (asset.tokenAddress === zeroAddress ? nativeTokenIcon : asset.logoUri) ||
            '/images/coin-icon-default.svg',
          address: asset.tokenAddress === null ? zeroAddress : asset.tokenAddress,
          truncatedCoinTotal: formatCoin(asset.balance, true, asset.decimals, symbol, false),
          fiatValue: tokenFiatBalance,
          symbol,
          fiatConversion: tokenPrice ? `1 ${symbol} = ${formatUSD(tokenPrice)}` : 'N/A',
          fullCoinTotal: formatCoin(asset.balance, false, asset.decimals, symbol),
          fiatDisplayValue: formatUSD(tokenFiatBalance),
          rawValue: asset.balance,
        };
        newDisplayData.push(formatted);
      }
      newDisplayData.sort((a, b) => b.fiatValue - a.fiatValue); // sort by USD value
      setTotalFiatValue(newTotalFiatValue);
      setDisplayData(newDisplayData);
    }

    loadDisplayData();
  }, [assets, nativeTokenIcon, chain, getTokenPrices]);

  return {
    totalFiatValue,
    displayData,
  };
}
