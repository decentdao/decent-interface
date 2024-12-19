import { useState } from 'react';
import { useBetween } from 'use-between';
import { Address } from 'viem';
import { useNetworkConfigStore } from '../../../providers/NetworkConfig/useNetworkConfigStore';
import { CacheKeys, CacheExpiry, FavoritesCacheValue } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';

const useSharedAccountFavorites = () => {
  const [favoritesList, setFavoritesList] = useState<FavoritesCacheValue[]>(
    getValue({ cacheName: CacheKeys.FAVORITES }) || [],
  );
  return {
    favoritesList,
    setFavoritesList,
  };
};

export const useAccountFavorites = () => {
  const { favoritesList, setFavoritesList } = useBetween(useSharedAccountFavorites);
  const { addressPrefix } = useNetworkConfigStore();

  const toggleFavorite = (address: Address, name: string) => {
    const favorites = getValue({ cacheName: CacheKeys.FAVORITES }) || [];
    let updatedFavorites: FavoritesCacheValue[] = [];

    const favoriteExists = favorites.some(
      favorite => favorite.address === address && favorite.networkPrefix === addressPrefix,
    );

    if (favoriteExists) {
      updatedFavorites = favorites.filter(
        favorite => !(favorite.address === address && favorite.networkPrefix === addressPrefix),
      );
    } else {
      updatedFavorites = favorites.concat([{ networkPrefix: addressPrefix, address, name }]);
    }

    setValue({ cacheName: CacheKeys.FAVORITES }, updatedFavorites, CacheExpiry.NEVER);
    setFavoritesList(updatedFavorites);
  };

  const isFavorite = (address: Address) => {
    return favoritesList.some(
      favorite => favorite.address === address && favorite.networkPrefix === addressPrefix,
    );
  };

  return { favoritesList, toggleFavorite, isFavorite };
};
