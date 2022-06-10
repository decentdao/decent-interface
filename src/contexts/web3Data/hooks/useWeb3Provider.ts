import { useContext } from 'react';
import { IWeb3ProviderContext, Web3ProviderContext } from '../Web3ProviderContext';

export const useWeb3Provider = (): IWeb3ProviderContext =>
  useContext(Web3ProviderContext as React.Context<IWeb3ProviderContext>);
