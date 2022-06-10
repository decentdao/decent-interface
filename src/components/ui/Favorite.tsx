import { useDAOData } from '../../contexts/daoData';
import { useWeb3 } from '../../contexts/web3Data';
import useFavorites from '../../hooks/useFavorites';
import Button from './forms/Button';

function FavoriteButton({ label, onClick }: { label: string; onClick: (() => void) | undefined }) {
  return (
    <Button
      isLarge={false}
      label={label}
      onClick={onClick}
    />
  );
}

function Favorite() {
  const [{ chainId }] = useWeb3();
  const [{ daoAddress }] = useDAOData();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  if (chainId === undefined || daoAddress === undefined) {
    return (
      <FavoriteButton
        label="is no fav"
        onClick={undefined}
      />
    );
  }

  const fav = isFavorite(chainId, daoAddress);

  if (fav) {
    return (
      <FavoriteButton
        label="is fav"
        onClick={() => removeFavorite(chainId, daoAddress)}
      />
    );
  } else {
    return (
      <FavoriteButton
        label="is no fav"
        onClick={() => addFavorite(chainId, daoAddress)}
      />
    );
  }
}

export default Favorite;
