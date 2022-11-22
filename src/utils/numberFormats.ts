import { BigNumber, ethers } from 'ethers';
import bigDecimal from 'js-big-decimal';
import { GnosisAssetFungible } from '../providers/fractal/types';

export const DEFAULT_DATE_FORMAT = 'MMM dd, yyyy, h:mm aa';

export const formatPercentage = (
  numerator: BigNumber | number | string,
  denominator: BigNumber | number | string
) => {
  const fraction = bigDecimal.divide(numerator.toString(), denominator.toString(), 18);
  const percent = parseFloat(bigDecimal.multiply(fraction, 100));
  if (percent < 0.01) {
    return '< 0.01%';
  }
  return Number(percent.toFixed(2)) + '%';
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export const formatUSD = (rawUSD: number | string) => {
  return usdFormatter.format(Number(rawUSD));
};

export const formatCoinUnits = (
  rawBalance: BigNumber | string,
  decimals?: number,
  symbol?: string
): number => {
  if (!rawBalance) rawBalance = '0';
  return symbol
    ? parseFloat(ethers.utils.formatUnits(rawBalance, decimals))
    : parseFloat(ethers.utils.formatEther(rawBalance));
};

export const formatCoinUnitsFromAsset = (asset: GnosisAssetFungible): number => {
  return formatCoinUnits(asset.balance, asset?.token?.decimals, asset?.token?.symbol);
};

export const formatCoin = (
  rawBalance: BigNumber | string,
  truncate: boolean,
  decimals?: number,
  symbol?: string
): string => {
  const amount = formatCoinUnits(rawBalance, decimals, symbol);

  const coinFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: !truncate ? 18 : amount > 1 ? 2 : 8,
  });

  return symbol
    ? coinFormatter.format(amount) + ' ' + symbol
    : coinFormatter.format(amount) + ' ETH';
};

export const formatCoinFromAsset = (asset: GnosisAssetFungible, truncate: boolean): string => {
  return formatCoin(asset.balance, truncate, asset?.token?.decimals, asset?.token?.symbol);
};
