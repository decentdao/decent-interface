const countDecimals = (value: number) => {
  const isWholeNumber = value % 1 === 0;
  if (isWholeNumber) return 0;

  const count = value.toString().split('.').pop();
  return count?.length || 0;
};

export default countDecimals;
