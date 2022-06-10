import { ethers } from 'ethers';
import { useLocalStorage } from './useLocalStorage';

type Favorites = {
  [chainId: number]: string[];
};

const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('favorites', {} as Favorites);

  const isFavorite = (chainId: number, address: string) => {
    if (favorites[chainId] === undefined) {
      return false;
    }

    try {
      // This might throw
      const normalizedAddress = ethers.utils.getAddress(address);
      return favorites[chainId].includes(normalizedAddress);
    } catch (e: unknown) {
      console.error(e);
      return false;
    }
  };

  const addFavorite = (chainId: number, address: string) => {
    try {
      // This might throw
      const normalizedAddress = ethers.utils.getAddress(address);
      if (favorites[chainId] === undefined) {
        // No favs for this chain exists, but favs for other chains might exist.
        // So, make sure to apply this single new fav for this chain into the existing
        // favs object.
        setFavorites(Object.assign({}, favorites, { [chainId]: [normalizedAddress] }));
      } else {
        // Favs for this chain already exist.
        const newFavorites = Object.assign({}, favorites);
        // So, just need to add one more fav address into existing array.
        newFavorites[chainId] = [...newFavorites[chainId], normalizedAddress];
        setFavorites(newFavorites);
      }
    } catch (e: unknown) {
      console.error(e);
      return;
    }
  };

  const removeFavorite = (chainId: number, address: string) => {
    if (favorites[chainId] === undefined) {
      return;
    }

    try {
      // This might throw
      const normalizedAddress = ethers.utils.getAddress(address);

      const newFavorites = Object.assign({}, favorites);
      newFavorites[chainId] = newFavorites[chainId].filter(
        favoriteAddress => favoriteAddress !== normalizedAddress
      );

      setFavorites(newFavorites);
    } catch (e: unknown) {
      console.error(e);
      return;
    }
  };

  return { favorites, isFavorite, addFavorite, removeFavorite };
};

export default useFavorites;
