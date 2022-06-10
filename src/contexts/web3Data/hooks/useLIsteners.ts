import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';

import { supportedChains } from '../chains';
import { ActionTypes, Web3ProviderActions } from '../actions';
import { getFallbackProvider, getInjectedProvider } from '../helpers';

const useListeners = (
  provider: ethers.providers.Provider | null,
  dispatch: React.Dispatch<ActionTypes>,
  web3Modal: Web3Modal
) => {
  const [myProvider, setMyProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    // subscribe to connect events
    web3Modal.on('connect', modalProvider => {
      if (!supportedChains().includes(parseInt(modalProvider.chainId))) {
        toast(`Switch to a supported chain: ${supportedChains().join(', ')}`, {
          toastId: 'switchChain',
        });
        web3Modal.clearCachedProvider();
        dispatch({
          type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
          payload: getFallbackProvider(),
        });
        setMyProvider(null);
      } else {
        const web3Provider = new ethers.providers.Web3Provider(modalProvider);
        setMyProvider(web3Provider);
        toast('Connected', { toastId: 'connected' });
      }
    });

    return () => {
      web3Modal.off('connect');
    };
  }, [web3Modal, dispatch]);

  useEffect(() => {
    if (!provider) return;

    // subscribe to chain events
    provider.on('chainChanged', (chainId: string) => {
      if (!supportedChains().includes(parseInt(chainId))) {
        toast(`Switch to a supported chain: ${supportedChains().join(', ')}`, {
          toastId: 'switchChain',
        });
        web3Modal.clearCachedProvider();
        (async () => {
          const userInjectedProvider = await getInjectedProvider(web3Modal);
          dispatch({
            type: Web3ProviderActions.SET_INJECTED_PROVIDER,
            payload: userInjectedProvider,
          });
          setMyProvider(null);
        })();
      } else {
        dispatch({
          type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
          payload: getFallbackProvider(),
        });
      }
    });

    // subscribe to account change events
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        toast('Account disconnected', { toastId: 'disconnected' });
        web3Modal.clearCachedProvider();
        (async () => {
          const userInjectedProvider = await getInjectedProvider(web3Modal);
          dispatch({
            type: Web3ProviderActions.SET_INJECTED_PROVIDER,
            payload: userInjectedProvider,
          });
          setMyProvider(null);
        })();
      } else {
        toast('Account changed', { toastId: 'connected' });
        web3Modal.connect();
      }
    });

    // subscribe to provider disconnection
    provider.on('disconnect', () => {
      toast('Account disconnected', { toastId: 'disconnected' });
      web3Modal.clearCachedProvider();
      dispatch({
        type: Web3ProviderActions.SET_FALLBACK_PROVIDER,
        payload: getFallbackProvider(),
      });
      setMyProvider(null);
    });

    // unsubscribe
    return () => {
      provider.removeAllListeners();
    };
  }, [provider, web3Modal, dispatch]);

  return myProvider;
};

export { useListeners };
