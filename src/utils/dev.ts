export const notProd = () => {
  return process.env.NODE_ENV !== 'production';
};

export const testErrorBoundary = () => {
  const empty: string[] = [];
  empty[1].charAt(1);
};
