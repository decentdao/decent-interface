import React, { createContext, useContext } from 'react';

import useProvider, { Web3Context, defaultWeb3Response } from './providers';

const createWeb3Root = (context: React.Context<Web3Context>) => {
  const Web3Root = ({ children }: { children: React.ReactNode }) => {
    const web3Provider = useProvider();

    return (
      <context.Provider value={web3Provider}>
        {children}
      </context.Provider>
    );
  };

  return Web3Root;
};

const web3Context = createContext(defaultWeb3Response);
const Web3Provider = createWeb3Root(web3Context);
const useWeb3: () => Web3Context = () => useContext(web3Context);

export { Web3Provider, useWeb3 };
