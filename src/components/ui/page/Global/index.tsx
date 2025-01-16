import * as amplitude from '@amplitude/analytics-browser';
import { Box } from '@chakra-ui/react';
import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { isFeatureEnabled } from '../../../../helpers/featureFlags';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import {
  CacheExpiry,
  CacheKeys,
  FavoritesCacheValue,
} from '../../../../hooks/utils/cache/cacheDefaults';
import { setValue } from '../../../../hooks/utils/cache/useLocalStorage';
import { getSafeName } from '../../../../hooks/utils/useGetSafeName';
import {
  getNetworkConfig,
  supportedNetworks,
} from '../../../../providers/NetworkConfig/useNetworkConfigStore';
import { wagmiConfig } from '../../../../providers/NetworkConfig/web3-modal.config';
import { useInitializeDemoMode } from '../../../../utils/demoMode';
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

  useEffect(() => {
    (async () => {
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

          const networkConfig = getNetworkConfig(favoriteChain.id);

          return Promise.all([favorite, getSafeName(networkConfig.subgraph, favorite.address)]);
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
  }, [favoritesList, onFavoritesUpdated]);
};

function Leave() {
  return (
    <Box lineHeight="1rem">
      <Box fontWeight="bold">This domain is shutting down on 2025-01-19.</Box>
      <Box mt="0.25rem">
        <Box>Please use:</Box>
        <Box>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://develop.decent-interface.pages.dev"
          >
            https://develop.decent-interface.pages.dev
          </a>
        </Box>
      </Box>
      <Box mt="0.25rem">
        <Box>Learn how to migrate your local &quot;My DAOs&quot; to the new domain:</Box>
        <Box>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://youtu.be/xvPrWmsBlBc"
          >
            https://youtu.be/xvPrWmsBlBc
          </a>
        </Box>
      </Box>
    </Box>
  );
}

const useLeave = () => {
  useEffect(() => {
    if (!isFeatureEnabled('flag_leave')) {
      return;
    }
    const leaveToast = toast.error(<Leave />, {
      dismissible: false,
      duration: Infinity,
      closeButton: false,
    });
    return () => {
      toast.dismiss(leaveToast);
    };
  }, []);
};

export function Global() {
  useUserTracking();

  // Initialize all modes from URL parameters
  useInitializeDemoMode();

  // Can remove this after about 2025-01-19 when we shut down Netlify
  useLeave();

  // Trigger a re-render when favorite names are updated
  const [favoritesUpdatedTrigger, setFavoritesUpdatedTrigger] = useState(0);
  useUpdateFavoritesCache(() => setFavoritesUpdatedTrigger(prev => prev + 1));

  return <Layout key={favoritesUpdatedTrigger} />;
}
