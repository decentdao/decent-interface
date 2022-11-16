import { BigNumber, constants, ethers } from 'ethers';
import { GnosisAssetFungible } from '../providers/fractal/types';

export const formatPercentage = (numerator: number, denominator: number) => {
  return parseFloat(((100 * numerator) / denominator).toPrecision(3)) + '%';
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
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
