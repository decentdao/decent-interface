import { useState } from 'react';
import { getAddress } from 'viem';
import { CacheKeys, CacheExpiry } from '../../utils/cache/cacheDefaults';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';

export const useAccountFavorites = () => {
  const { setValue, getValue } = useLocalStorage();
  const [favoritesList, setFavoritesList] = useState<string[]>(getValue(CacheKeys.FAVORITES));

  const toggleFavorite = (address: string) => {
    const normalizedAddress = getAddress(address);
    const favorites: string[] = getValue(CacheKeys.FAVORITES);
    let updatedFavorites: string[] = [];

    if (favorites.includes(normalizedAddress)) {
      updatedFavorites = favorites.filter(favorite => favorite !== normalizedAddress);
    } else {
      updatedFavorites = favorites.concat([normalizedAddress]);
    }

    setValue(CacheKeys.FAVORITES, updatedFavorites, CacheExpiry.NEVER);
    setFavoritesList(updatedFavorites);
  };

  return { favoritesList, toggleFavorite };
};