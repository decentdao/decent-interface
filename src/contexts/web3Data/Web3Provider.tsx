import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Web3Modal from 'web3modal';
import type { ConnectFn, DisconnectFn, InitialState } from './types';
import { ActionTypes, Web3ProviderActions } from './actions';
import { Web3ProviderContext } from './Web3ProviderContext';
import { WEB3_MODAL_CONFIG } from './web3Modal.config';
import { getLocalProvider, getFallbackProvider, getInjectedProvider } from './helpers';
import { toast } from 'react-toastify';
import { useListeners } from './hooks/useLIsteners';
import { supportedChains } from './chains';

const web3Modal = new Web3Modal(WEB3_MODAL_CONFIG);
const initialState: InitialState = {
  account: null,
  signer: null,
  connectionType: 'not connected',
  network: '',
  chainId: 0,
  provider: null,
  isProviderLoading: false,
};

const getInitialState = () => {
  return {
    ...initialState,
    isProviderLoading: true,
  };
};

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case Web3ProviderActions.SET_INJECTED_PROVIDER: {
      const { account, signer, provider, connectionType, network, chainId } = action.payload;
      return {
        ...state,
        account,
        signer,
        provider,
        connectionType,
        network,
        chainId,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.SET_LOCAL_PROVIDER:
    case Web3ProviderActions.SET_FALLBACK_PROVIDER: {
      const { provider, connectionType, network, chainId } = action.payload;
      return {
        ...initialState,
        provider,
        connectionType,
        network,
        chainId,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.DISCONNECT_WALLET: {
      web3Modal.clearCachedProvider();
      return { ...initialState };
    }
    default:
      return state;
  }
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const connectDefaultProvider = useCallback(async () => {
    if (process.env.REACT_APP_LOCAL_PROVIDER_URL && process.env.NODE_ENV === 'development') {
      dispatch({
        type: Web3ProviderActions.SET_LOCAL_PROVIDER,
        payload: await getLocalProvider(),
      });
    } else {
      dispatch({
        type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
        payload: getFallbackProvider(),
      });
    }
  }, []);

  const connect: ConnectFn = useCallback(async () => {
    const userInjectedProvider = await getInjectedProvider(web3Modal);
    if (supportedChains().includes(userInjectedProvider.chainId)) {
      dispatch({
        type: Web3ProviderActions.SET_INJECTED_PROVIDER,
        payload: userInjectedProvider,
      });
    } else {
      web3Modal.clearCachedProvider();
    }
  }, []);

  const disconnect: DisconnectFn = useCallback(() => {
    toast('Account disconnected', { toastId: 'disconnected' });
    // switch to a default provider
    connectDefaultProvider();
    // remove cached provider
    web3Modal.clearCachedProvider();
  }, [connectDefaultProvider]);

  useListeners(web3Modal, connectDefaultProvider, connect);

  const load = useCallback(() => {
    if (web3Modal.cachedProvider) {
      connect();
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
  }, [connect]);

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
