import { ethers } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { CacheExpiry, CacheKeys, useLocalStorage } from '../../utils/useLocalStorage';

/**
 * handles loading favorites data into Fractal state
 */
export const useAccountFavorites = () => {
  const {
    node: { daoAddress },
  } = useFractal();

  const { setValue, getValue } = useLocalStorage();
  const favoritesList = useMemo<string[]>(() => getValue(CacheKeys.FAVORITES), [getValue]);

  /**
   * @returns favorited status of loaded safe
   */
  const isConnectedFavorited = useMemo(
    () => (!daoAddress ? false : favoritesList.includes(daoAddress)),
    [daoAddress, favoritesList]
  );

  /**
   * toggles the given address's favorited status
   *
   * if IS favorited it will remove from the address from local storage and state favorite lists
   * if NOT favorited, the address will be saved to local storage and state favorites
   */
  const toggleFavorite = useCallback(
    (address: string) => {
      const normalizedAddress = ethers.utils.getAddress(address);
      let updatedFavorites: string[] = [];

      if (favoritesList.includes(normalizedAddress)) {
        updatedFavorites = favoritesList.filter(favorite => favorite !== normalizedAddress);
      } else {
        updatedFavorites = favoritesList.concat([normalizedAddress]);
      }
      setValue(CacheKeys.FAVORITES, updatedFavorites, CacheExpiry.NEVER);
    },
    [favoritesList, setValue]
  );

  return { favoritesList, isConnectedFavorited, toggleFavorite };
};
