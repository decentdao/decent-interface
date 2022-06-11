export const supportedChains = () => {
  const dev =
    process.env.NODE_ENV !== 'production'
      ? [parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID || '0')]
      : [];
  const supported = [
    ...dev,
    ...(process.env.REACT_APP_SUPPORTED_CHAIN_IDS || '').split(',').map(i => parseInt(i)),
  ];
  return supported;
};
