import { createContext, useContext } from 'react';

import useBlockchainDatas, { BlockchainDataContext, defaultBlockchainDataResponse } from './blockchainData';

const createBlockchainDataRoot = (context: React.Context<BlockchainDataContext>) => {
  const BlockchainDataRoot = ({ children }: { children: React.ReactNode }) => {
    const blockchainData = useBlockchainDatas();

    return (
      <context.Provider value={blockchainData}>
        {children}
      </context.Provider>
    );
  };

  return BlockchainDataRoot;
};

const blockchainDataDataContext = createContext(defaultBlockchainDataResponse);
const BlockchainDataProvider = createBlockchainDataRoot(blockchainDataDataContext);
const useBlockchainData: () => BlockchainDataContext = () => useContext(blockchainDataDataContext);

export { BlockchainDataProvider, useBlockchainData };
