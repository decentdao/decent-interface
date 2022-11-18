import { ethers } from 'ethers';
import ethDefault from '../../../assets/images/coin-icon-eth.svg';
import { GnosisAssetFungible } from '../../../providers/fractal/types';
import { formatCoin, formatUSD } from '../../../utils/numberFormats';

export interface TokenDisplayData {
  iconUri: string;
  address: string;
  symbol: string;
  truncatedCoinTotal: string;
  fullCoinTotal: string;
  fiatValue: number;
  fiatDisplayValue: string;
  fiatConversion: string;
}

export function useFormatCoins(assets: GnosisAssetFungible[]) {
  let totalFiatValue = 0;
  let displayData: TokenDisplayData[] = [];
  for (let i = 0; i < assets.length; i++) {
    let asset = assets[i];
    totalFiatValue += Number(asset.fiatBalance);
    let symbol = asset.token === null ? 'ETH' : asset.token.symbol;
    if (symbol === 'ETH' && asset.balance === '0') continue; // if Eth balance is zero, don't add it to the list
    const formatted: TokenDisplayData = {
      iconUri: asset.token === null ? ethDefault : asset.token.logoUri,
      address: asset.tokenAddress === null ? ethers.constants.AddressZero : asset.tokenAddress,
      truncatedCoinTotal: formatCoin(
        asset.balance,
        true,
        asset?.token?.decimals,
        asset?.token?.symbol
      ),
      fiatValue: Number(asset.fiatBalance),
      symbol: symbol,
      fiatConversion: `1 ${symbol} = ${formatUSD(Number(asset.fiatConversion))}`,
      fullCoinTotal: formatCoin(asset.balance, false, asset?.token?.decimals, asset?.token?.symbol),
      fiatDisplayValue: formatUSD(Number(asset.fiatBalance)),
    };
    displayData.push(formatted);
  }
  displayData.sort((a, b) => b.fiatValue - a.fiatValue); // sort by USD value
  return {
    totalFiatValue: totalFiatValue,
    displayData: displayData,
  };
}
