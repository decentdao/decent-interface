const mainnetAddresses = [
  {
    key: 'USDC',
    value: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  {
    key: 'WETH',
    value: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
];

const getMainnetAddress = (symbol: string, { fallback }: { [key: string]: string }) => {
  const mainnetAddress = mainnetAddresses.find(({ key }) => key === symbol);
  return mainnetAddress?.value || fallback;
};

export default getMainnetAddress;
