import { utils, BigNumber } from 'ethers';

export const formatWeiToValue = (amountInWei: string | BigNumber, decimals: number) => {
  const value = Number(utils.formatUnits(amountInWei, decimals));
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const numberFormatted = (number: number, decimals: number, currencyId?: string) => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
    style: currencyId ? 'currency' : undefined,
    currency: currencyId,
  }).format(number);
};
