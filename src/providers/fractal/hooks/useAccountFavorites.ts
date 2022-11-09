import { ethers } from 'ethers';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useWeb3Provider } from './../../../contexts/web3Data/hooks/useWeb3Provider';
import { AccountAction } from './../constants/actions';
import { CacheKeys } from './useLocalStorage';

interface IUseFavorties {
  safeAddress?: string;
  accountDispatch: any;
}

export const useAccountFavorites = ({ safeAddress, accountDispatch }: IUseFavorties) => {
  const [favoritesList, setFavorites] = useState<string[]>([]);

  const {
    state: { chainId },
  } = useWeb3Provider();

  const isConnectedFavorited = useMemo(
    () => (!safeAddress ? false : favoritesList.includes(safeAddress)),
    [safeAddress, favoritesList]
  );

  const toggleFavorite = useCallback(
    (key: string) => {
      const normalizedAddress = ethers.utils.getAddress(key);
      const rawFavorites = localStorage.getItem(CacheKeys.FAVORITES);
      let updatedFavorites = [] as string[];
      if (rawFavorites) {
        const parsedFavorites = JSON.parse(rawFavorites);
        if ([...favoritesList].includes(normalizedAddress)) {
          updatedFavorites = [...favoritesList].filter(favorite => favorite !== normalizedAddress);

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

  // load Favorites
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // set Favorites
  useEffect(() => {
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
