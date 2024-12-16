import { isAddress } from 'viem';
import { CacheExpiry, CacheKeys, FavoritesCacheValue } from '../cacheDefaults';
import { getValue, setValue } from '../useLocalStorage';

const migrateFavorites = (v1FavoritesData: string[]) => {
  if (v1FavoritesData.length === 0) {
    return;
  }

  const newFavorites: FavoritesCacheValue[] = [];

  for (const v1Favorite of v1FavoritesData) {
    const [networkPrefix, address] = v1Favorite.split(':');
    if (!networkPrefix || !address) {
      continue;
    }
    if (!isAddress(address)) {
      continue;
    }

    newFavorites.push({ networkPrefix, address, name: '' });
  }

  // Set new Favorites cache
  setValue({ cacheName: CacheKeys.FAVORITES }, newFavorites, CacheExpiry.NEVER);

  // Remove old favorites
  localStorage.removeItem(
    JSON.stringify({
      cacheName: CacheKeys.FAVORITES,
      version: 1,
    }),
  );
};

//@dev for testing seperated the function from the hook and export
export default function migration3() {
  const currentFavorites =
    (getValue({ cacheName: CacheKeys.FAVORITES }, 1) as unknown as string[]) || [];
  migrateFavorites(currentFavorites);
}
