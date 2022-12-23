import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, ethers } from 'ethers';
import bigDecimal from 'js-big-decimal';

export const DEFAULT_DATE_TIME_FORMAT = 'MMM dd, yyyy, h:mm aa';
export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';

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
  const formatted = usdFormatter.format(Number(rawUSD));
  const decimalIndex = formatted.indexOf('.');
  return decimalIndex != -1 && formatted.length - decimalIndex !== 3 ? formatted + '0' : formatted;
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

export const formatCoinUnitsFromAsset = (asset: SafeBalanceUsdResponse): number => {
  return formatCoinUnits(asset.balance, asset.token?.decimals, asset.token?.symbol);
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

export const formatCoinFromAsset = (asset: SafeBalanceUsdResponse, truncate: boolean): string => {
  return formatCoin(asset.balance, truncate, asset?.token?.decimals, asset?.token?.symbol);
};

function getNumberSeparator(type: 'group' | 'decimal'): string {
  return (
    Intl.NumberFormat()
      .formatToParts(1000.1)
      .find(part => part.type === type)?.value || ','
  );
}

export function formatBigNumberDisplay(num: BigNumber | string | number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, getNumberSeparator('group'));
}
