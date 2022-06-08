import { createContext, useContext } from 'react';

import useDAODatas, { DAODataContext, defaultDAODataResponse } from './daoData';

const createDAODataRoot = (context: React.Context<DAODataContext>) => {
  function DAODataRoot({ children }: { children: React.ReactNode }) {
    const daoData = useDAODatas();

    return <context.Provider value={daoData}>{children}</context.Provider>;
  }

  return DAODataRoot;
};

const daoDataContext = createContext(defaultDAODataResponse);
const DAODataProvider = createDAODataRoot(daoDataContext);
const useDAOData: () => DAODataContext = () => useContext(daoDataContext);

export { DAODataProvider, useDAOData };
