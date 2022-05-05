import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';

import { supportedChains } from './chains';

const useListeners = (provider: ethers.providers.Provider | undefined, web3Modal: Web3Modal) => {
  const [myProvider, setMyProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    // subscribe to connect events
    web3Modal.on('connect', provider => {
      if (!supportedChains().includes(parseInt(provider.chainId))) {
        toast(`Switch to a supported chain: ${supportedChains().join(", ")}`, { toastId: 'switchChain' });
        web3Modal.clearCachedProvider();
        setMyProvider(null);
      } else {
        const web3Provider = new ethers.providers.Web3Provider(provider);
        setMyProvider(web3Provider);
        toast('Connected', { toastId: 'connected' });
      }
    });

    return () => {
      web3Modal.off('connect');
    };
  }, [web3Modal]);

  useEffect(() => {
    if (!provider) return;

    // subscribe to chain events
    provider.on('chainChanged', (chainId: string) => {
      if (!supportedChains().includes(parseInt(chainId))) {
        toast(`Switch to a supported chain: ${supportedChains().join(", ")}`, { toastId: 'switchChain' });
        web3Modal.clearCachedProvider();
        setMyProvider(null);
      } else {
        window.location.reload();
      };
    });

    // subscribe to account change events
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        toast('Account disconnected', { toastId: 'disconnected' });
        web3Modal.clearCachedProvider();
        setMyProvider(null);
      } else {
        toast('Account changed', { toastId: 'connected' });
        web3Modal.connect();
      }
    });

    // subscribe to provider disconnection
    provider.on('disconnect', () => {
      toast('Account disconnected', { toastId: 'disconnected' });
      web3Modal.clearCachedProvider();
      setMyProvider(null);
    });

    // unsubscribe
    return () => {
      provider.removeAllListeners();
    };
  }, [provider, web3Modal]);

  return myProvider;
}

export { useListeners };
