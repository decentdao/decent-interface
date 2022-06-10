import { createContext } from 'react';
import { ActionTypes } from './actions';
import { ConnectFn, DisconnectFn, InitialState } from './types';

export interface IWeb3ProviderContext {
  state: InitialState;
  dispatch: React.Dispatch<ActionTypes>;
  connect: ConnectFn;
  disconnect: DisconnectFn;
}

export const Web3ProviderContext = createContext<IWeb3ProviderContext | null>(null);
