import countDecimals from '../../../utils/countDecimals';

const numberWithCommas = (number: number, decimals: number) => {
  const n = number.toFixed(decimals);
  return n.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
};

export const formatFiatAmount = (currencyKey: string, amount: number) => {
  // 1234.567 -> 1,234.56
  const currency = numberWithCommas(amount, 2);

  // on occasion, we'll need to display the `amount` with
  // at least 2 decimal places, unless the amount is a
  // whole number. doing so will prevent oddly formatted
  // values (e.g. "$0.5", "$1234.00").
  const decimals = countDecimals(amount);
  const maxDecimals = decimals ? Math.max(2, decimals) : 0;
  // 1234.567 -> 1,234.567, 1234 -> 1,234
  const formattedAmount = numberWithCommas(amount, maxDecimals);

  return {
    [currencyKey]: {
      amount,
      currency,
      formattedAmount,
    },
  };
};
