import React, { createContext, useContext } from 'react';

import useProvider, { Web3Custom, defaultWeb3 } from './providers';

const createWeb3Root = (context: React.Context<readonly [Web3Custom, () => void, () => void]>) => {
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

const web3Context = createContext([defaultWeb3, () => {}, () => {}] as const);

const Web3Provider = createWeb3Root(web3Context);

const useWeb3 = () => {
  return useContext(web3Context);
};

export { Web3Provider, useWeb3 };
