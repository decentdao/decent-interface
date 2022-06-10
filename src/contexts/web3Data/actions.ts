import { InjectedProviderInfo, BaseProviderInfo } from './types';

export enum Web3ProviderActions {
  CONNECT_WALLET = 'CONNECT_WALLET',
  DISCONNECT_WALLET = 'DISCONNECT_WALLET',
  SET_INJECTED_PROVIDER = 'SET_INJECTED_PROVIDER',
  SET_LOCAL_PROVIDER = 'SET_LOCAL_PROVIDER',
  SET_FALLBACK_PROVIDER = 'SET_FALLBACK_PROVIDER',
  RESET_STATE = 'RESET_STATE',
}

export type ActionTypes =
  | {
      type: Web3ProviderActions.CONNECT_WALLET;
      payload: {};
    }
  | {
      type: Web3ProviderActions.DISCONNECT_WALLET;
    }
  | {
      type: Web3ProviderActions.SET_INJECTED_PROVIDER;
      payload: InjectedProviderInfo;
    }
  | {
      type: Web3ProviderActions.SET_LOCAL_PROVIDER;
      payload: BaseProviderInfo;
    }
  | {
      type: Web3ProviderActions.SET_FALLBACK_PROVIDER;
      payload: BaseProviderInfo;
    }
  | {
      type: Web3ProviderActions.RESET_STATE;
      payload: {};
    };
