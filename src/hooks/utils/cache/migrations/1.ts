import { addNetworkPrefix } from '../../../../utils/url';
// This should be a temporary hook to migrate the old local storage to the new one
// and should be removed after a few months

import { CacheExpiry, CacheKeys } from '../cacheDefaults';
import { setValue } from '../useLocalStorage';

const deleteAllV0FractData = (fractKeys: string[]) => {
  // delete old cache
  fractKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

const createV1FavoratesData = (v0FavoritesData: string[]) => {
  if (v0FavoritesData.length === 0) {
    return;
  }

  const newFavorites: string[] = [];

  // loop through all favorites
  for (const v0Favorite of v0FavoritesData) {
    // Get ChainId from favorite key
    const [, chainId] = v0Favorite.split('_');
    if (Number.isNaN(Number(chainId))) {
      continue;
    }
    const v0FavoriteValue = localStorage.getItem(v0Favorite);
    if (v0FavoriteValue) {
      // Parse favorites value and add network prefix
      const v0ParsedValue: { v: string[] } = JSON.parse(v0FavoriteValue);
      v0ParsedValue.v.forEach((value: string) => {
        newFavorites.push(addNetworkPrefix(value, Number(chainId)));
      });
    }
  }

  // Set new Favorites cache
  setValue({ cacheName: CacheKeys.FAVORITES }, newFavorites, CacheExpiry.NEVER);
};

//@dev for testing seperated the function from the hook and export
export default function migration1() {
  const allV0FractKeys = Object.keys(localStorage).filter(key => key.startsWith('fract_'));
  const v0FavoritesData = allV0FractKeys.filter(key => key.endsWith('favorites'));

  createV1FavoratesData(v0FavoritesData);
  deleteAllV0FractData(allV0FractKeys);
}
