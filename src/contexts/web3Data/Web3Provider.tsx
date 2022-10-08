import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Web3Modal from 'web3modal';
import type { ConnectFn, DisconnectFn, InitialState } from './types';
import { ActionTypes, Web3ProviderActions } from './actions';
import { WEB3_MODAL_CONFIG } from './web3Modal.config';
import { getLocalProvider, getFallbackProvider, getInjectedProvider } from './helpers';
import { toast } from 'react-toastify';
import { useListeners } from './hooks/useListeners';
import { getSupportedChains } from './chains';
import { Web3ProviderContext } from './hooks/useWeb3Provider';
import { useTranslation } from 'react-i18next';

const web3Modal = new Web3Modal(WEB3_MODAL_CONFIG);
const initialState: InitialState = {
  account: null,
  signerOrProvider: null,
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
      const { account, signerOrProvider, provider, connectionType, network, chainId } =
        action.payload;
      return {
        ...state,
        account,
        signerOrProvider,
        provider,
        connectionType,
        network,
        chainId,
        isProviderLoading: false,
      };
    }
    case Web3ProviderActions.SET_LOCAL_PROVIDER: {
      return { ...state, ...action.payload, isProviderLoading: false };
    }
    case Web3ProviderActions.SET_FALLBACK_PROVIDER: {
      const { provider, connectionType, network, chainId, signerOrProvider } = action.payload;
      return {
        ...initialState,
        provider,
        connectionType,
        network,
        chainId,
        signerOrProvider,
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
  const { t } = useTranslation('menu');

  const connectDefaultProvider = useCallback(async () => {
    web3Modal.clearCachedProvider();
    if (process.env.REACT_APP_LOCAL_PROVIDER_URL && process.env.NODE_ENV !== 'production') {
      const localProviderInfo = await getLocalProvider();
      if (!!localProviderInfo) {
        dispatch({
          type: Web3ProviderActions.SET_LOCAL_PROVIDER,
          payload: localProviderInfo,
        });
        return;
      }
      web3Modal.clearCachedProvider();
    }
    dispatch({
      type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
      payload: getFallbackProvider(),
    });
  }, []);

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
  }, [connectDefaultProvider, t]);

  const disconnect: DisconnectFn = useCallback(() => {
    toast(t('toastAccountDisconnected'), { toastId: 'disconnected' });
    // switch to a default provider
    connectDefaultProvider();
  }, [connectDefaultProvider, t]);

  useListeners(web3Modal, connectDefaultProvider, connect);

  const load = useCallback(() => {
    if (web3Modal.cachedProvider) {
      connect();
      return;
    }
    connectDefaultProvider();
  }, [connect, connectDefaultProvider]);

  useEffect(() => load(), [load]);

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
