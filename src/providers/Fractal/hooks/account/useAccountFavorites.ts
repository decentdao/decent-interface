import { ethers } from 'ethers';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { AccountAction } from '../../constants/actions';
import { CacheExpiry, CacheKeys, useLocalStorage } from './useLocalStorage';

interface IUseFavorites {
  safeAddress?: string;
  accountDispatch: any;
}

/**
 * handles loading favorites data into Fractal state
 */
export const useAccountFavorites = ({ safeAddress, accountDispatch }: IUseFavorites) => {
  const { setValue, getValue } = useLocalStorage();
  const [favoritesList, setFavorites] = useState<string[]>(getValue(CacheKeys.FAVORITES));

  /**
   * @returns favorited status of loaded safe
   */
  const isConnectedFavorited = useMemo(
    () => (!safeAddress ? false : favoritesList.includes(safeAddress)),
    [safeAddress, favoritesList]
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
      setFavorites(updatedFavorites);
    },
    [favoritesList, setValue]
  );

  useEffect(() => {
    // this keeps the account information update to date with any changes made.
    accountDispatch({
      type: AccountAction.UPDATE_DAO_FAVORITES,
      payload: {
        favoritesList,
        isConnectedFavorited,
        toggleFavorite,
      },
    });
  }, [accountDispatch, isConnectedFavorited, toggleFavorite, favoritesList]);
};
