import { useEffect } from 'react';
import { useFractal } from '../../providers/App/AppProvider';

export const usePageTitle = () => {
  const {
    node: { daoName },
  } = useFractal();

  useEffect(() => {
    if (daoName) {
      document.title = `${import.meta.env.VITE_APP_NAME} | ${daoName}`;
    }

    return () => {
      document.title = import.meta.env.VITE_APP_NAME;
    };
  }, [daoName]);
};
