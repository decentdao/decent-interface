import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';

import { supportedChains } from '../chains';
import { ActionTypes, Web3ProviderActions } from '../actions';
import { getFallbackProvider, getInjectedProvider, getLocalProvider } from '../helpers';

const useListeners = (web3Modal: Web3Modal, dispatch: React.Dispatch<ActionTypes>) => {
  const [modalProvider, setModalProvider] = useState<ethers.providers.Web3Provider | null>(null);

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
  }, [dispatch]);

  useEffect(() => {
    // subscribe to connect events
    web3Modal.on('connect', _modalProvider => {
      // check that connected chain is supported
      if (!supportedChains().includes(parseInt(_modalProvider.chainId))) {
        toast(`Switch to a supported chain: ${supportedChains().join(', ')}`, {
          toastId: 'switchChain',
        });
        // remove cached provider
        web3Modal.clearCachedProvider();
        // switch to a default provider
        connectDefaultProvider();
      } else {
        setModalProvider(_modalProvider);
        toast('Connected', { toastId: 'connected' });
      }
    });
  }, [web3Modal, connectDefaultProvider]);

  useEffect(() => {
    if (!modalProvider) return;

    // subscribe to chain events
    modalProvider.on('chainChanged', (chainId: string) => {
      if (!supportedChains().includes(parseInt(chainId))) {
        // check that connected chain is supported
        toast(`Chain changed: Switch to a supported chain: ${supportedChains().join(', ')}`, {
          toastId: 'switchChain',
        });
        // remove cached provider
        web3Modal.clearCachedProvider();
        // switch to a default provider
        connectDefaultProvider();
      } else {
        toast(`Chain changed: ${chainId}`, {
          toastId: 'connected',
        });
        (async () => {
          const userInjectedProvider = await getInjectedProvider(web3Modal);
          dispatch({
            type: Web3ProviderActions.SET_INJECTED_PROVIDER,
            payload: userInjectedProvider,
          });
        })();
      }
    });

    // subscribe to account change events
    modalProvider.on('accountsChanged', (accounts: string[]) => {
      if (!accounts.length) {
        toast('Account access revoked', { toastId: 'accessChanged' });
        // switch to a default provider
        connectDefaultProvider();
        // remove cached provider
        web3Modal.clearCachedProvider();
        // remove listeners
        setModalProvider(null);
      } else {
        toast('Account changed', { toastId: 'connected' });
        (async () => {
          const userInjectedProvider = await getInjectedProvider(web3Modal);
          dispatch({
            type: Web3ProviderActions.SET_INJECTED_PROVIDER,
            payload: userInjectedProvider,
          });
        })();
      }
    });

    // subscribe to provider disconnection
    modalProvider.on('disconnect', () => {
      toast('Account disconnected', { toastId: 'disconnected' });
      // switch to a default provider
      connectDefaultProvider();
      // remove cached provider
      web3Modal.clearCachedProvider();
      // remove listeners
      setModalProvider(null);
    });

    // unsubscribe
    return () => {
      modalProvider.removeAllListeners();
    };
  }, [modalProvider, web3Modal, dispatch, connectDefaultProvider]);
};

export { useListeners };
