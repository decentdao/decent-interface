import { useEffect } from 'react';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import useDAOName from '../DAO/useDAOName';

export const useDocTitle = () => {
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();
  const { daoRegistryName } = useDAOName({
    address: address ? address : undefined,
  });
  useEffect(() => {
    document.title = daoRegistryName ? daoRegistryName + ' | Fractal' : 'Fractal';
  }, [daoRegistryName]);
};
