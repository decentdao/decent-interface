import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ContentBox from '../../components/ui/ContentBox';
import { TextButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';
import useDAOContract from '../../contexts/daoData/useDAOContract';
import useDAOName from '../../contexts/daoData/useDAOName';
import { useWeb3 } from '../../contexts/web3Data';
import useFavorites from '../../hooks/useFavorites';
import useIsDAO from '../../hooks/useIsDAO';

function FavoriteRow({ address }: { address: string }) {
  const [isDAO, isDAOLoading] = useIsDAO(address);
  const daoName = useDAOName(useDAOContract(address));
  const [daoNameDisplay, setDAONameDisplay] = useState('...');

  useEffect(() => {
    if (isDAOLoading) {
      setDAONameDisplay('...');
      return;
    }

    if (!isDAO) {
      setDAONameDisplay('unknown');
      return;
    }

    if (!daoName) {
      setDAONameDisplay('...');
      return;
    }

    setDAONameDisplay(daoName);
  }, [isDAOLoading, isDAO, daoName]);

  return (
    <div className="py-4 first:pt-0 last:pb-0 border-b border-gray-100 last:border-b-0 truncate">
      <div className="text-lg">{daoNameDisplay}</div>
      <div>
        <Link to={`/daos/${address}`}>
          <TextButton
            label={address}
            className="-ml-4"
          />
        </Link>
      </div>
    </div>
  );
}

function DAOFavorites() {
  const [{ chainId }] = useWeb3();
  const { favorites } = useFavorites();

  const [chainFavorites, setChainFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (!chainId) {
      setChainFavorites([]);
      return;
    }

    if (!favorites[chainId]) {
      setChainFavorites([]);
      return;
    }

    setChainFavorites(favorites[chainId]);
  }, [favorites, chainId]);

  return (
    <div className="text-gray-25">
      <H1>Favorite Fractals</H1>
      <ContentBox>
        {chainFavorites.length === 0 ? (
          <div>No favorites!</div>
        ) : (
          <div>
            {chainFavorites.map(favorite => (
              <FavoriteRow
                key={favorite}
                address={favorite}
              />
            ))}
          </div>
        )}
      </ContentBox>
    </div>
  );
}

export default DAOFavorites;
