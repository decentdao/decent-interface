import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import BigDecimal from 'js-big-decimal';
import { formatEther, formatUnits } from 'viem';

export const DEFAULT_DATE_TIME_FORMAT = 'MMM dd, yyyy, h:mm aa O';
export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';

export const formatPercentage = (
  numerator: bigint | number | string,
  denominator: bigint | number | string,
) => {
  const fraction = BigDecimal.divide(numerator.toString(), denominator.toString(), 18);
  const percent = parseFloat(BigDecimal.multiply(fraction, 100));
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

const formatCoinUnits = (
  rawBalance: bigint | string,
  decimals?: number,
  symbol?: string,
): number => {
  if (!rawBalance) rawBalance = '0';
  return symbol && decimals
    ? parseFloat(formatUnits(BigInt(rawBalance), decimals))
    : parseFloat(formatEther(BigInt(rawBalance)));
};

export const formatCoinUnitsFromAsset = (asset: SafeBalanceUsdResponse): number => {
  return formatCoinUnits(asset.balance, asset.token?.decimals, asset.token?.symbol);
};

export const formatCoin = (
  rawBalance: bigint | string,
  truncate: boolean,
  decimals?: number,
  symbol?: string,
  showSymbol: boolean = true,
): string => {
  const amount = formatCoinUnits(rawBalance, decimals, symbol);

  const coinFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: !truncate ? 18 : amount > 1 ? 2 : 8,
  });

  if (showSymbol) {
    return symbol
      ? coinFormatter.format(amount) + ' ' + symbol
      : coinFormatter.format(amount) + ' ETH';
  }

  return coinFormatter.format(amount);
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

export function formatBigIntDisplay(num: bigint | string | number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, getNumberSeparator('group'));
}
