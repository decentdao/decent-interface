import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import useFavorites from '../../hooks/useFavorites';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { StarFilled, StarEmpty } from '../ui/svg/Star';
import TooltipWrapper from '../ui/TooltipWrapper';

function FavoriteButton({
  icon,
  onClick,
}: {
  icon: React.ReactElement;
  onClick: (() => void) | undefined;
}) {
  return (
    <div className="flex items-center">
      <button onClick={onClick}>{icon}</button>
    </div>
  );
}

function Buttons() {
  const {
    state: { chainId },
  } = useWeb3Provider();
  const {
    mvd: {
      dao: { daoAddress },
    },
  } = useFractal();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  if (chainId === undefined || daoAddress === undefined) {
    return (
      <FavoriteButton
        icon={<StarEmpty />}
        onClick={undefined}
      />
    );
  }

  const fav = isFavorite(chainId, daoAddress);

  if (fav) {
    return (
      <TooltipWrapper
        isVisible={true}
        content="Remove from favorites"
      >
        <FavoriteButton
          icon={<StarFilled />}
          onClick={() => removeFavorite(chainId, daoAddress)}
        />
      </TooltipWrapper>
    );
  } else {
    return (
      <TooltipWrapper
        isVisible={true}
        content="Add to favorites"
      >
        <FavoriteButton
          icon={<StarEmpty />}
          onClick={() => addFavorite(chainId, daoAddress)}
        />
      </TooltipWrapper>
    );
  }
}

function Favorite() {
  return (
    <div className="text-gold-500 mr-2 font-sans text-sm">
      <Buttons />
    </div>
  );
}

export default Favorite;
