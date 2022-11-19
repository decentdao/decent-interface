import { BigNumber, ethers } from 'ethers';
import bigDecimal from 'js-big-decimal';

export const DEFAULT_DATE_FORMAT = 'MMM dd, yyyy, h:mm aa';

export const formatPercentage = (
  numerator: BigNumber | number | string,
  denominator: BigNumber | number | string
) => {
  const divide = bigDecimal.divide(numerator.toString(), denominator.toString(), 18);
  const percent = parseFloat(bigDecimal.multiply(divide, 100)).toPrecision(3);
  return percent + '%';
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatUSD = (rawUSD: number) => {
  return usdFormatter.format(rawUSD);
};

export const formatCoin = (
  rawBalance: BigNumber | string,
  truncate: boolean,
  decimals?: number,
  symbol?: string
) => {
  const amount = symbol
    ? parseFloat(ethers.utils.formatUnits(rawBalance, decimals))
    : parseFloat(ethers.utils.formatEther(rawBalance));

  const coinFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: !truncate ? 18 : amount > 1 ? 2 : 8,
  });

  return symbol
    ? coinFormatter.format(parseFloat(ethers.utils.formatUnits(rawBalance, decimals))) +
        ' ' +
        symbol
    : coinFormatter.format(parseFloat(ethers.utils.formatEther(rawBalance))) + ' ETH';
};
