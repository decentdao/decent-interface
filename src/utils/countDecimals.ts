const countDecimals = (value: number) => {
  const isWholeNumber = value % 1 === 0;
  if (isWholeNumber) return 0;

  const decimals = value.toString().split('.').pop();
  return decimals?.length || 0;
};

export default countDecimals;
