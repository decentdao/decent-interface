import { InjectedProviderInfo, BaseProviderInfo } from './types';

export enum Web3ProviderActions {
  DISCONNECT_WALLET = 'DISCONNECT_WALLET',
  SET_INJECTED_PROVIDER = 'SET_INJECTED_PROVIDER',
  SET_LOCAL_PROVIDER = 'SET_LOCAL_PROVIDER',
  SET_FALLBACK_PROVIDER = 'SET_FALLBACK_PROVIDER',
}

export type ActionTypes =
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
    };
