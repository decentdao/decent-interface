import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, constants } from 'ethers';
import { useEffect, useState } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import usePriceAPI from '../../../../providers/App/hooks/usePriceAPI';
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

export function useFormatCoins(assets: SafeBalanceUsdResponse[]) {
  const { nativeTokenSymbol, nativeTokenIcon } = useNetworkConfig();
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
            const tokenFiatBalanceBn = BigNumber.from(asset.balance)
              .mul(Math.round(parseFloat(tokenPrice.toFixed(5)) * multiplicator)) // We'll be loosing precision with super small prices like for meme coins. But that shouldn't be awfully off
              .div(BigNumber.from(10).pow(asset.token?.decimals || 18));
            tokenFiatBalance = tokenFiatBalanceBn.gte(constants.MaxUint256)
              ? tokenFiatBalanceBn.div(multiplicator).toNumber()
              : tokenFiatBalanceBn.toNumber() / multiplicator;
            newTotalFiatValue += tokenFiatBalance;
          } catch (e) {
            logError('Error while calculating token fiat balance', e);
          }
        }

        let symbol = asset.token === null ? nativeTokenSymbol : asset.token.symbol;
        const formatted: TokenDisplayData = {
          iconUri: asset.token === null ? nativeTokenIcon : asset.token.logoUri,
          address: asset.tokenAddress === null ? constants.AddressZero : asset.tokenAddress,
          truncatedCoinTotal: formatCoin(asset.balance, true, asset?.token?.decimals, symbol),
          fiatValue: tokenFiatBalance,
          symbol: symbol,
          fiatConversion: tokenPrice ? `1 ${symbol} = ${formatUSD(tokenPrice)}` : 'N/A',
          fullCoinTotal: formatCoin(asset.balance, false, asset?.token?.decimals, symbol),
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
  }, [assets, nativeTokenIcon, nativeTokenSymbol, getTokenPrices]);

  return {
    totalFiatValue,
    displayData,
  };
}
