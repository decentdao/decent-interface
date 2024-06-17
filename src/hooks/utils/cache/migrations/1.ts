import { addNetworkPrefix } from '../../../../utils/url';
// This should be a temporary hook to migrate the old local storage to the new one
// and should be removed after a few months

import { CacheKeys } from '../cacheDefaults';
import { setValue } from '../useLocalStorage';

//@dev for testing seperated the function from the hook and export
export default function v1MigrateFavorites() {
  // Migrate old cache keys to new format
  const keys = Object.keys(localStorage);
  const fractKeys = keys.filter(key => key.startsWith('fract_'));

  // Get All Network Favorites
  const favoritesCache = fractKeys.filter(key => key.endsWith('favorites'));
  const newFavorites: string[] = [];

  // loop through all favorites
  for (const favorite of favoritesCache) {
    // Get ChainId from favorite key
    const [, chainId] = favorite.split('_');
    if (Number.isNaN(Number(chainId))) {
      continue;
    }
    const favoritesValue = localStorage.getItem(favorite);
    if (favoritesValue) {
      // Parse favorites value and add network prefix
      const parsedValue: { v: string[] } = JSON.parse(favoritesValue);
      parsedValue.v.forEach((value: string) => {
        newFavorites.push(addNetworkPrefix(value, Number(chainId)));
      });
    }
  }
  if (newFavorites.length) {
    // Set new Favorites cache
    setValue({ cacheName: CacheKeys.FAVORITES }, newFavorites);
  }

  // delete old cache
  fractKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}
