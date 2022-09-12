import { utils } from 'ethers';
import countDecimals from '../../../utils/countDecimals';

export const formatAmount = (key: string, amount: number) => {
  // e.g. 1_234.567 -> 1,234.56
  const currency = utils.commify(amount.toFixed(2));

  // on occasion, we'll need to display the `amount` with
  // at least 2 decimal places, unless the amount is a
  // whole number. doing will prevent oddly formatted
  // values (e.g. "$0.5", "$1234.00").
  // e.g. 1_234.567 -> 1,234.567; 1_234 -> 1,234
  const decimals = countDecimals(amount);
  const maxDecimals = decimals ? Math.max(2, decimals) : 0;
  const formattedAmount = utils.commify(amount.toFixed(maxDecimals));

  return {
    [key]: {
      amount,
      currency,
      formattedAmount,
    },
  };
};
