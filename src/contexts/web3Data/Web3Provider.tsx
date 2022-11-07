import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';
import { ActionTypes, Web3ProviderActions } from './actions';
import { getSupportedChains } from './chains';
import { useListeners } from './hooks/useListeners';
import { Web3ProviderContext } from './hooks/useWeb3Provider';
import type { ConnectFn, DisconnectFn, InitialState } from './types';
import { getFallbackProvider, getInjectedProvider, getLocalFallbackProvider } from './utils';
import { WEB3_MODAL_CONFIG } from './web3Modal.config';

const initialState: InitialState = {
  account: null,
  signerOrProvider: null,
  connectionType: 'not connected',
  network: '',
  chainId: 0,
  provider: null,
  isProviderLoading: true,
};

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case Web3ProviderActions.SET_INJECTED_PROVIDER: {
      return {
        ...state,
        ...action.payload,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.SET_LOCAL_PROVIDER: {
      return { ...state, ...action.payload, isProviderLoading: false };
    }
    case Web3ProviderActions.SET_FALLBACK_PROVIDER: {
      return {
        ...initialState,
        ...action.payload,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.DISCONNECT_WALLET: {
      return { ...initialState };
    }
    default:
      return state;
  }
};

const getInitialState = () => {
  if (process.env.REACT_APP_LOCAL_PROVIDER_URL && process.env.NODE_ENV !== 'production') {
    const localProviderInfo = getLocalFallbackProvider();
    if (!!localProviderInfo) {
      return { ...initialState, isProviderLoading: false, ...localProviderInfo };
    }
  }
  return { ...initialState, isProviderLoading: false, ...getFallbackProvider() };
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, getInitialState);
  const web3Modal = useMemo(() => new Web3Modal(WEB3_MODAL_CONFIG), []);

  const { t } = useTranslation('menu');

  /**
   * Connects to a fallback provider
   * if the REACT_APP_LOCAL_PROVIDER_URL is set as an env, the local node (if running) will be connected
   * Otherwise, the fallback chaind defined in the env REACT_APP_FALLBACK_CHAIN_ID will be used.
   */
  const connectDefaultProvider = useCallback(() => {
    web3Modal.clearCachedProvider();
    if (process.env.REACT_APP_LOCAL_PROVIDER_URL && process.env.NODE_ENV !== 'production') {
      const localProviderInfo = getLocalFallbackProvider();
      if (!!localProviderInfo) {
        dispatch({
          type: Web3ProviderActions.SET_LOCAL_PROVIDER,
          payload: localProviderInfo,
        });
        return;
      }
    }
    dispatch({
      type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
      payload: getFallbackProvider(),
    });
  }, [web3Modal]);

  /**
   * Connects using web3Modal
   * If the connect network is not supported the fallback provider is set
   */
  const connect: ConnectFn = useCallback(async () => {
    const userInjectedProvider = await getInjectedProvider(web3Modal);
    if (!!userInjectedProvider && getSupportedChains().includes(userInjectedProvider.chainId)) {
      toast(t('toastConnected'), { toastId: 'connected' });
      dispatch({
        type: Web3ProviderActions.SET_INJECTED_PROVIDER,
        payload: userInjectedProvider,
      });
    } else {
      connectDefaultProvider();
    }
  }, [connectDefaultProvider, t, web3Modal]);

  /**
   * Disconnects wallet, sets provider to fallback
   */
  const disconnect: DisconnectFn = useCallback(() => {
    toast(t('toastAccountDisconnected'), { toastId: 'disconnected' });
    // switch to a default provider
    connectDefaultProvider();
  }, [connectDefaultProvider, t]);

  useListeners(web3Modal, connectDefaultProvider, connect);

  useEffect(() => {
    if (web3Modal.cachedProvider && !state.isProviderLoading) {
      (async () => {
        await connect();
      })();
    }
  }, [connect, state.isProviderLoading, web3Modal]);

  const contextValue = useMemo(
    () => ({
      state,
      connect,
      disconnect,
    }),
    [state, connect, disconnect]
  );
  return (
    <Web3ProviderContext.Provider value={contextValue}>{children}</Web3ProviderContext.Provider>
  );
}
