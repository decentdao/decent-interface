export type CoinGeckoApiResponse = {
  [addressOrId: string]: {
    [currencyId: string]: number;
  };
};
