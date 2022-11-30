import { useEffect } from 'react';

export enum CacheKeys {
  FAVORITES = 'favorites',
  AUDIT = 'not_audited_acceptance',
}

/**
 * Maps Cached Values
 * @dev update this array to create a new cached item
 * these items are automatically mapped through and added to a user's localstorage on first vist
 */
const CACHE_MAPPING = [
  {
    key: CacheKeys.FAVORITES,
    defaultValue: {},
  },
  {
    key: CacheKeys.AUDIT,
    defaultValue: false,
  },
];

export const useLocalStorage = () => {
  /**
   * adds empty objects for setting up caching
   */
  useEffect(() => {
    CACHE_MAPPING.forEach(({ key, defaultValue }) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
      }
    });
    return;
  }, []);
};
