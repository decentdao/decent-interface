import { createContext, useContext } from 'react';

import { DAOData, useDAODatas } from './daoData';

const createDAODataRoot = (context: React.Context<readonly [DAOData, React.Dispatch<React.SetStateAction<string | undefined>>]>) => {
  const DAODataRoot = ({ children }: { children: React.ReactNode }) => {
    const daoData = useDAODatas();

    return (
      <context.Provider value={daoData}>
        {children}
      </context.Provider>
    );
  };

  return DAODataRoot;
};

const daoDataContext = createContext<readonly [DAOData, React.Dispatch<React.SetStateAction<string | undefined>>]>([{} as DAOData, () => undefined]);
const DAODataProvider = createDAODataRoot(daoDataContext);
const useDAOData = () => useContext(daoDataContext);

export { DAODataProvider, useDAOData };
