import { BigNumber, ethers } from 'ethers';

export const formatPercentage = (numerator: number, denominator: number) => {
  return parseFloat(((100 * numerator) / denominator).toPrecision(3)) + '%';
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
