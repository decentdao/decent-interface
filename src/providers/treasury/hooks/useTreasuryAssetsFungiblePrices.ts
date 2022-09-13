import axios from 'axios';
import { ethers } from 'ethers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenDepositEvent, TreasuryAssetFungible, TreasuryAssetFungiblePrices } from '../types';
import { buildCoinGeckoApiUrlForErc20Tokens, buildCoinGeckoApiUrlForNativeToken } from '../helpers';
import { CoinGeckoApiResponse } from '../types/coingecko';
import { formatFiatAmount } from '../utils';

/**
 * generates an object of prices per fungible asset
 *
 * @param assets
 * @returns TreasuryAssetFungiblePrices | {}
 */
const useTreasuryAssetsFungiblePrices = (
  assets: TreasuryAssetFungible[],
  selectedCurrency: string,
  nativeDeposits?: TokenDepositEvent[]
) => {
  const [prices, setPrices] = useState<TreasuryAssetFungiblePrices | {}>({});

  // used to get cached prices in `useEffect`s (below)
  const queryClient = useQueryClient();

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

  const queryConfig = {
    onSuccess: formatPricesData,
    refetchInterval: 60 * 1000,
    staleTime: 60 * 1000,
  };

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

    const url = buildCoinGeckoApiUrlForNativeToken(selectedCurrency);
    const { data } = await axios.get<CoinGeckoApiResponse>(url);

    // this coingecko endpoint returns an object with a
    // key named "ethereum" like so: `{ ethereum: 1000 }`.
    // however, the value of this object is displayed in
    // the UI based on the key matching `contractAddress`.
    // here, the value is deconstructed, and then
    // reconstructed with the appropriate address.
    const [value] = Object.values(data);
    return { [ethers.constants.AddressZero]: value };
  }, [hasNativeDeposits, selectedCurrency]);

  useQuery(queryKeyNativeToken, fetchPriceNativeToken, queryConfig);

  useEffect(() => {
    const data = queryClient.getQueryData(queryKeyNativeToken);

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
        .filter(address => address !== ethers.constants.AddressZero),
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

    return data;
  }, [erc20TokensAddresses, selectedCurrency]);

  useQuery(queryKeyErc20Tokens, fetchPricesErc20Tokens, queryConfig);

  useEffect(() => {
    const data = queryClient.getQueryData(queryKeyErc20Tokens);

    if (data) {
      formatPricesData(data);
    }
  }, [formatPricesData, queryClient, queryKeyErc20Tokens]);

  return prices;
};

export default useTreasuryAssetsFungiblePrices;
