import * as amplitude from '@amplitude/analytics-browser';
import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';
import { createPublicClient, http, PublicClient } from 'viem';
import { useAccount } from 'wagmi';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import {
  CacheExpiry,
  CacheKeys,
  FavoritesCacheValue,
} from '../../../../hooks/utils/cache/cacheDefaults';
import { setValue } from '../../../../hooks/utils/cache/useLocalStorage';
import { getSafeName } from '../../../../hooks/utils/useGetSafeName';
import { useDynamicWagmiConfig } from '../../../../providers/NetworkConfig/useDynamicWagmiConfig';
import {
  getNetworkConfig,
  supportedNetworks,
} from '../../../../providers/NetworkConfig/useNetworkConfigStore';
import { getChainIdFromPrefix } from '../../../../utils/url';
import { Layout } from '../Layout';

const useUserTracking = () => {
  const { address } = useAccount();
  useEffect(() => {
    Sentry.setUser(address ? { id: address } : null);
    if (address) {
      amplitude.setUserId(address);
    } else {
      amplitude.reset();
    }
  }, [address]);
};

const useUpdateFavoritesCache = (onFavoritesUpdated: () => void) => {
  const { favoritesList } = useAccountFavorites();
  const wagmiConfig = useDynamicWagmiConfig();

  useEffect(() => {
    (async () => {
      const publicClientsByChain = new Map<number, PublicClient>();

      const favoriteNames = await Promise.all(
        favoritesList.map(async favorite => {
          const favoriteChain = wagmiConfig.chains.find(
            chain => chain.id === getChainIdFromPrefix(favorite.networkPrefix),
          );
          if (!favoriteChain) {
            return;
          }

          const favoriteNetwork = supportedNetworks.find(
            network => network.chain.id === favoriteChain.id,
          );
          if (!favoriteNetwork) {
            return;
          }

          let favoritePublicClient = publicClientsByChain.get(favoriteChain.id);

          if (!favoritePublicClient) {
            favoritePublicClient = createPublicClient({
              chain: favoriteChain,
              transport: http(favoriteNetwork.rpcEndpoint),
            });
            publicClientsByChain.set(favoriteChain.id, favoritePublicClient);
          }

          const networkConfig = getNetworkConfig(favoriteChain.id);

          return Promise.all([
            favorite,
            getSafeName(favoritePublicClient, networkConfig.subgraph, favorite.address),
          ]);
        }),
      );

      const updatedFavorites: FavoritesCacheValue[] = [];

      favoriteNames.forEach(favoriteAndName => {
        if (!favoriteAndName) {
          return;
        }

        const [favorite, name] = favoriteAndName;
        if (favorite.name !== name) {
          favorite.name = name;
          updatedFavorites.push(favorite);
        }
      });

      if (updatedFavorites.length > 0) {
        const allFavorites = favoritesList.map(original => {
          const updated = updatedFavorites.find(
            update =>
              update.networkPrefix === original.networkPrefix &&
              update.address === original.address,
          );
          return updated || original;
        });

        setValue({ cacheName: CacheKeys.FAVORITES }, allFavorites, CacheExpiry.NEVER);
        onFavoritesUpdated();
      }
    })();
  }, [favoritesList, onFavoritesUpdated, wagmiConfig.chains]);
};

export function Global() {
  useUserTracking();

  // Trigger a re-render when favorite names are updated
  const [favoritesUpdatedTrigger, setFavoritesUpdatedTrigger] = useState(0);
  useUpdateFavoritesCache(() => setFavoritesUpdatedTrigger(prev => prev + 1));

  return <Layout key={favoritesUpdatedTrigger} />;
}
