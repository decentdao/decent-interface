export type CoingeckoApiResponse = {
  [address: string]: {
    [currency: string]: number;
  };
};
