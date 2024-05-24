import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { CacheKeys, CacheExpiry } from '../../utils/cache/cacheDefaults';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';

/**
 * handles loading favorites data into Fractal state
 */
export const useAccountFavorites = () => {
  const {
    node: { daoAddress },
  } = useFractal();

  const { setValue, getValue } = useLocalStorage();
  const [favoritesList, setFavoritesList] = useState<string[]>([]);

  useEffect(() => {
    setFavoritesList(getValue(CacheKeys.FAVORITES));
  }, [getValue]);

  /**
   * @returns favorited status of loaded safe
   */
  const isConnectedFavorited = useMemo(
    () => (!daoAddress ? false : favoritesList.includes(daoAddress)),
    [daoAddress, favoritesList],
  );

  /**
   * toggles the given address's favorited status
   *
   * if IS favorited it will remove from the address from local storage and state favorite lists
   * if NOT favorited, the address will be saved to local storage and state favorites
   */
  const toggleFavorite = useCallback(
    (address: string) => {
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
    },
    [getValue, setValue],
  );

  return { favoritesList, isConnectedFavorited, toggleFavorite };
};
