import { useEffect } from 'react';

export enum CacheKeys {
  FAVORITES = 'favorites',
  AUDIT = 'not_audited_acceptance',
}

// mapping to allow adding new caching options' defaultValues easier
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
