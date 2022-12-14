import { ethers } from 'ethers';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { AccountAction } from '../../constants/actions';
import { useFractal } from '../useFractal';
import { CacheKeys } from './useLocalStorage';

interface IUseFavorites {
  safeAddress?: string;
  accountDispatch: any;
}

/**
 * handles loading favorites data into Fractal state
 */
export const useAccountFavorites = ({ safeAddress, accountDispatch }: IUseFavorites) => {
  const [favoritesList, setFavorites] = useState<string[]>([]);

  const {
    state: { chainId },
  } = useWeb3Provider();

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
      const rawFavorites = localStorage.getItem(CacheKeys.FAVORITES);

      let updatedFavorites = [] as string[];
      if (rawFavorites) {
        const parsedFavorites = JSON.parse(rawFavorites);
        if (favoritesList.includes(normalizedAddress)) {
          updatedFavorites = favoritesList.filter(favorite => favorite !== normalizedAddress);
          const newValue = JSON.stringify({
            ...parsedFavorites,
            [chainId]: updatedFavorites,
          });
          localStorage.setItem(CacheKeys.FAVORITES, newValue);
        } else {
          updatedFavorites = [...favoritesList, normalizedAddress];
          const newValue = JSON.stringify({
            ...parsedFavorites,
            [chainId]: updatedFavorites,
          });
          localStorage.setItem(CacheKeys.FAVORITES, newValue);
        }
      }
      setFavorites(updatedFavorites);
    },
    [favoritesList, chainId]
  );

  const loadFavorites = useCallback(() => {
    const rawFavorites = localStorage.getItem(CacheKeys.FAVORITES);
    if (rawFavorites) {
      const parsedFavorites = JSON.parse(rawFavorites)[chainId];
      setFavorites(parsedFavorites || []);
    }
  }, [chainId]);

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

/**
 * @returns favorited status of the provided safe address
 */
export const useIsFavorite = (safeAddress: string) => {
  const {
    account: {
      favorites: { favoritesList },
    },
  } = useFractal();
  return !safeAddress ? false : favoritesList.includes(safeAddress);
};
