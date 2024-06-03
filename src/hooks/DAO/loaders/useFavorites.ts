import { useState } from 'react';
import { getAddress } from 'viem';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { CacheKeys, CacheExpiry } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';

export const useAccountFavorites = () => {
  // @dev favorites are strings of the form networkPrefix:address
  const [favoritesList, setFavoritesList] = useState<string[]>(
    getValue({ cacheName: CacheKeys.FAVORITES }) || [],
  );
  const { addressPrefix } = useNetworkConfig();

  const toggleFavorite = (address: string) => {
    const normalizedAddress = getAddress(address);
    const addressWithPrefix = addressPrefix + ":" + normalizedAddress;
    
    const favorites: string[] = getValue({ cacheName: CacheKeys.FAVORITES }) || [];
    let updatedFavorites: string[] = [];
    if (favorites.includes(addressWithPrefix)) {
      updatedFavorites = favorites.filter(favorite => favorite !== addressWithPrefix);
    } else {
      updatedFavorites = favorites.concat([addressWithPrefix]);
    }

    setValue({ cacheName: CacheKeys.FAVORITES }, updatedFavorites, CacheExpiry.NEVER);
    setFavoritesList(updatedFavorites);
  };

  return { favoritesList, toggleFavorite };
};
