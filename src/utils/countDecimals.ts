const countDecimals = (value: number) => {
  if (!value || value % 1 === 0) return 0;
  const count = value?.toString().split('.').pop();
  return count?.length || 0;
};

export default countDecimals;
