import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Web3Modal from 'web3modal';
import type { ConnectFn, DisconnectFn, InitialState } from './types';
import { ActionTypes, Web3ProviderActions } from './actions';
import { Web3ProviderContext } from './Web3ProviderContext';
import { WEB3_MODAL_CONFIG } from './web3Modal.config';
import {
  getLocalProvider,
  getFallbackProvider,
  getInjectedProvider,
  makeInjectedProvider,
} from './helpers';
import { useListeners } from './hooks/useLIsteners';
import { toast } from 'react-toastify';

const web3Modal = new Web3Modal(WEB3_MODAL_CONFIG);
const initialState: InitialState = {
  wallet: {
    account: null,
    signer: null,
  },
  connection: {
    name: 'not connected',
    network: '',
    chainId: 0,
  },
  provider: null,
  isProviderLoading: false,
  isCacheProvider: undefined,
};

const getInitialState = () => {
  return {
    ...initialState,
    isProviderLoading: true,
    isCacheProvider: !!web3Modal.cachedProvider,
  };
};

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case Web3ProviderActions.SET_INJECTED_PROVIDER: {
      const { wallet, connection, provider } = action.payload;
      return {
        ...state,
        wallet,
        provider,
        connection,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.SET_LOCAL_PROVIDER:
    case Web3ProviderActions.SET_FALLBACK_PROVIDER: {
      const { connection, provider } = action.payload;
      return {
        ...initialState,
        wallet: {
          account: null,
          signer: null,
        },
        provider,
        connection,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.DISCONNECT_WALLET: {
      web3Modal.clearCachedProvider();
      return { ...initialState };
    }
    // might not need this?
    case Web3ProviderActions.RESET_STATE:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  const reloadedProvider = useListeners(state.provider, dispatch, web3Modal);
  useEffect(() => {
    if (!reloadedProvider) {
      dispatch({
        type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
        payload: getFallbackProvider(),
      });
    } else {
      (async () => {
        const injectedProvider = await makeInjectedProvider(reloadedProvider);
        dispatch({
          type: Web3ProviderActions.SET_INJECTED_PROVIDER,
          payload: injectedProvider,
        });
      })();
    }
  }, [reloadedProvider]);

  const load = useCallback(() => {
    if (web3Modal.cachedProvider) {
      (async () => {
        const userInjectedProvider = await getInjectedProvider(web3Modal);
        dispatch({
          type: Web3ProviderActions.SET_INJECTED_PROVIDER,
          payload: userInjectedProvider,
        });
      })();
      return;
    }
    if (process.env.REACT_APP_LOCAL_PROVIDER_URL && process.env.NODE_ENV === 'development') {
      (async () => {
        const localProvider = await getLocalProvider();
        dispatch({
          type: Web3ProviderActions.SET_LOCAL_PROVIDER,
          payload: localProvider,
        });
        return;
      })();
    }
    dispatch({
      type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
      payload: getFallbackProvider(),
    });
  }, []);

  const connect: ConnectFn = useCallback(() => {
    web3Modal.connect().catch(console.error);
    return null;
  }, []);

  const disconnect: DisconnectFn = useCallback(() => {
    web3Modal.clearCachedProvider();
    toast('Account disconnected', { toastId: 'disconnected' });
    dispatch({ type: Web3ProviderActions.SET_FALLBACK_PROVIDER, payload: getFallbackProvider() });
    return null;
  }, []);

  useEffect(() => load(), [load]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      connect,
      disconnect,
    }),
    [state, dispatch, connect, disconnect]
  );
  return (
    <Web3ProviderContext.Provider value={contextValue}>{children}</Web3ProviderContext.Provider>
  );
}
