import { BigNumber, ethers } from 'ethers';

export const formatPercentage = (numerator: number, denominator: number) => {
  return parseFloat(((100 * numerator) / denominator).toPrecision(4)) + '%';
};

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const coinFormatter = (
  rawBalance: BigNumber | string,
  decimals?: number,
  symbol?: string
) => {
  return symbol
    ? ethers.utils.formatUnits(rawBalance, decimals) + ' ' + symbol
    : ethers.utils.formatEther(rawBalance) + ' ETH';
};
