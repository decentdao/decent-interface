export type CoinGeckoPrice = {
  [currencyId: string]: number;
}

export type CoinGeckoApiResponse = {
  [addressOrId: string]: CoinGeckoPrice;
}
