import { useEffect } from 'react';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';

export const usePageTitle = () => {
  const { subgraphInfo } = useDaoInfoStore();
  useEffect(() => {
    if (subgraphInfo?.daoName) {
      document.title = `${import.meta.env.VITE_APP_NAME} | ${subgraphInfo?.daoName}`;
    }

    return () => {
      document.title = import.meta.env.VITE_APP_NAME;
    };
  }, [subgraphInfo?.daoName]);
};
