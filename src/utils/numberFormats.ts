export const formatPercentage = (numerator: number, denominator: number) => {
  return parseFloat(((100 * numerator) / denominator).toPrecision(4)) + '%';
};

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
