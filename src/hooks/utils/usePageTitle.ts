import { useEffect } from 'react';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';

export const usePageTitle = () => {
  const { daoName } = useDaoInfoStore();
  useEffect(() => {
    if (daoName) {
      document.title = `${import.meta.env.VITE_APP_NAME} | ${daoName}`;
    }

    return () => {
      document.title = import.meta.env.VITE_APP_NAME;
    };
  }, [daoName]);
};
