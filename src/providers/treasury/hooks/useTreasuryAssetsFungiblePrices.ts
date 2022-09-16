import axios from 'axios';
import { constants } from 'ethers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenDepositEvent, TreasuryAssetFungible, TreasuryAssetsFungiblePrices } from '../types';
import { buildCoinGeckoApiUrlForErc20Tokens, buildCoinGeckoApiUrlForNativeToken } from '../helpers';
import { CoinGeckoApiResponse, CoinGeckoPrice } from '../types/coingecko';
import { formatFiatAmount } from '../utils';

/**
 * generates an object of prices per fungible asset
 *
 * @param assets
 * @returns TreasuryAssetsFungiblePrices | {}
 */
const useTreasuryAssetsFungiblePrices = (
  assets: TreasuryAssetFungible[],
  selectedCurrency: string,
  nativeDeposits?: TokenDepositEvent[]
) => {
  const [prices, setPrices] = useState<TreasuryAssetsFungiblePrices | {}>({});

  const formatPricesData = useCallback(
    (data: CoinGeckoApiResponse | {}) => {
      const formattedPrices = Object.entries(data).reduce((result, [address, price]) => {
        const amount = price[selectedCurrency];
        const formattedPrice = formatFiatAmount(selectedCurrency, amount);

        return { ...result, [address]: formattedPrice };
      }, {});

      setPrices(x => ({ ...x, ...formattedPrices }));
    },
    [selectedCurrency, setPrices]
  );

  const isValidCoinGeckoApiResponse = useCallback(
    (data: unknown) =>
      !!data &&
      typeof data === 'object' &&
      Object.values(data).every(
        (value: unknown): value is CoinGeckoPrice =>
          !!value &&
          (value as CoinGeckoPrice).hasOwnProperty(selectedCurrency) &&
          typeof (value as CoinGeckoPrice)[selectedCurrency] === 'number'
      ),
    [selectedCurrency]
  );

  // used to get cached prices in `useEffect`s (below)
  const queryClient = useQueryClient();

  // both `useQuery`s below need the same config
  const queryConfig = useMemo(() => {
    const oneMinute = 60 * 1000;

    return {
      onSuccess: formatPricesData,
      refetchInterval: oneMinute,
      staleTime: oneMinute,
    };
  }, [formatPricesData]);

  /**
   * fetch price for native token
   */
  const hasNativeDeposits = useMemo(() => Boolean(nativeDeposits?.length), [nativeDeposits]);

  const queryKeyNativeToken = useMemo(
    () => ['priceNativeToken', hasNativeDeposits, selectedCurrency],
    [selectedCurrency, hasNativeDeposits]
  );

  const fetchPriceNativeToken = useCallback(async () => {
    if (!hasNativeDeposits) return {};

    // this coingecko endpoint returns an object with a
    // key named "ethereum" like so: `{ ethereum: 1000 }`.
    const url = buildCoinGeckoApiUrlForNativeToken(selectedCurrency);
    const { data } = await axios.get<CoinGeckoApiResponse>(url);

    if (!isValidCoinGeckoApiResponse(data)) return {};

    // however, the value of this object is displayed in
    // the UI based on the key matching `contractAddress`.
    // therefore, the value is deconstructed, and then
    // reconstructed with the appropriate address.
    const [value] = Object.values(data);
    return { [constants.AddressZero]: value };
  }, [hasNativeDeposits, isValidCoinGeckoApiResponse, selectedCurrency]);

  useQuery(queryKeyNativeToken, fetchPriceNativeToken, queryConfig);

  useEffect(() => {
    const data = queryClient.getQueryData<TreasuryAssetsFungiblePrices>(queryKeyNativeToken);

    if (data) {
      formatPricesData(data);
    }
  }, [formatPricesData, queryClient, queryKeyNativeToken]);

  /**
   * fetch price for erc20 tokens
   */
  const erc20TokensAddresses = useMemo(
    () =>
      assets
        .map(({ contractAddress }) => contractAddress)
        .filter(address => address !== constants.AddressZero),
    [assets]
  );

  const queryKeyErc20Tokens = useMemo(
    () => ['pricesErc20Tokens', selectedCurrency, erc20TokensAddresses],
    [selectedCurrency, erc20TokensAddresses]
  );

  const fetchPricesErc20Tokens = useCallback(async () => {
    if (erc20TokensAddresses.length === 0) return {};

    const url = buildCoinGeckoApiUrlForErc20Tokens(erc20TokensAddresses, selectedCurrency);
    const { data } = await axios.get<CoinGeckoApiResponse>(url);

    if (!isValidCoinGeckoApiResponse(data)) return {};

    return data;
  }, [erc20TokensAddresses, isValidCoinGeckoApiResponse, selectedCurrency]);

  useQuery(queryKeyErc20Tokens, fetchPricesErc20Tokens, queryConfig);

  useEffect(() => {
    const data = queryClient.getQueryData<TreasuryAssetsFungiblePrices>(queryKeyErc20Tokens);

    if (data) {
      formatPricesData(data);
    }
  }, [formatPricesData, queryClient, queryKeyErc20Tokens]);

  return prices;
};

export default useTreasuryAssetsFungiblePrices;
