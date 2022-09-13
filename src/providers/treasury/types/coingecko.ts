export type CoinGeckoApiResponse = {
  [address: string]: {
    [currency: string]: number;
  };
};
