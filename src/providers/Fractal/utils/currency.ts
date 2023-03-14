export const numberFormatted = (number: number, decimals: number, currencyId?: string) => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
    style: currencyId ? 'currency' : undefined,
    currency: currencyId,
  }).format(number);
};
