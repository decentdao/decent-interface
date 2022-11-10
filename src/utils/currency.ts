import { utils } from 'ethers';

export const formatWeiToValue = (amountInWei: string, decimals: number) => {
  const value = Number(utils.formatUnits(amountInWei, decimals));
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};
