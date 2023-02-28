const countDecimals = (value: number) => {
  const isWholeNumber = value % 1 === 0;
  if (isWholeNumber) return 0;

  const decimals = value.toString().split('.').pop();
  return decimals?.length || 0;
};

export const removeTrailingZeros = (input: string) => {
  if (input.includes('.')) {
    const [leftDigits, rightDigits] = input.split('.');
    if (Number(rightDigits) === 0) {
      return input.slice(0, leftDigits.length);
    }
  }
  return input;
};

export default countDecimals;
