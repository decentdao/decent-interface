import { useState } from 'react';
import { Address } from 'viem';
import { CacheKeys, CacheExpiry } from '../../utils/cache/cacheDefaults';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';

export const useAccountFavorites = () => {
  const { setValue, getValue } = useLocalStorage();
  const [favoritesList, setFavoritesList] = useState<Address[]>(getValue(CacheKeys.FAVORITES));

  const toggleFavorite = (address: Address) => {
    const normalizedAddress = address;
    const favorites: Address[] = getValue(CacheKeys.FAVORITES);
    let updatedFavorites: Address[] = [];

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
