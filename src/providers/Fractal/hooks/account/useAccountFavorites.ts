import { ethers } from 'ethers';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNetworkConfg } from '../../../NetworkConfig/NetworkConfigProvider';
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
  const [favoritesList, setFavorites] = useState<string[]>([]);
  const { chainId } = useNetworkConfg();
  const { setValue, getValue } = useLocalStorage();

  /**
   * @returns favorited status of loaded safe
   */
  const isConnectedFavorited = useMemo(
    () => (!safeAddress ? false : favoritesList.includes(safeAddress)),
    [safeAddress, favoritesList]
  );

  /**
   * checks if given address is favorited:
   * if favorited it will remove from local storage and state
   * if not favorited, given address will be saved to local storage with the give id
   */
  const toggleFavorite = useCallback(
    (address: string) => {
      const normalizedAddress = ethers.utils.getAddress(address);
      const rawFavorites = getValue(CacheKeys.FAVORITES);

      let updatedFavorites = [] as string[];
      if (rawFavorites) {
        const parsedFavorites = JSON.parse(rawFavorites);
        if (favoritesList.includes(normalizedAddress)) {
          updatedFavorites = favoritesList.filter(favorite => favorite !== normalizedAddress);
          const newValue = JSON.stringify({
            ...parsedFavorites,
            [chainId]: updatedFavorites,
          });
          setValue(CacheKeys.FAVORITES, newValue, CacheExpiry.NEVER);
        } else {
          updatedFavorites = [...favoritesList, normalizedAddress];
          const newValue = JSON.stringify({
            ...parsedFavorites,
            [chainId]: updatedFavorites,
          });
          setValue(CacheKeys.FAVORITES, newValue, CacheExpiry.NEVER);
        }
      }
      setFavorites(updatedFavorites);
    },
    [getValue, favoritesList, chainId, setValue]
  );

  const loadFavorites = useCallback(() => {
    const rawFavorites = getValue(CacheKeys.FAVORITES);
    if (rawFavorites) {
      const parsedFavorites = JSON.parse(rawFavorites)[chainId];
      setFavorites(parsedFavorites || []);
    }
  }, [chainId, getValue]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

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
