import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { ConnectFn, ModalProvider } from './../types';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';

import { supportedChains } from '../chains';

const useListeners = (
  web3Modal: Web3Modal,
  connectDefaultProvider: () => void,
  connect: ConnectFn
) => {
  const [modalProvider, setModalProvider] = useState<ModalProvider | null>(null);

  useEffect(() => {
    // subscribe to connect events
    web3Modal.on('connect', _modalProvider => {
      // check that connected chain is supported
      if (!supportedChains().includes(parseInt(_modalProvider.chainId))) {
        toast(`Switch to a supported chain: ${supportedChains().join(', ')}`, {
          toastId: 'switchChain',
        });
        // switch to a default provider
        connectDefaultProvider();
      } else {
        setModalProvider(_modalProvider);
        toast('Connected', { toastId: 'connected' });
      }
    });
    return () => {
      web3Modal.off('connect');
    };
  }, [web3Modal, connectDefaultProvider]);

  useEffect(() => {
    const chainChangedCallback = (chainId: string) => {
      if (!supportedChains().includes(parseInt(chainId))) {
        // check that connected chain is supported
        toast(`Chain changed: Switch to a supported chain: ${supportedChains().join(', ')}`, {
          toastId: 'switchChain',
        });
        // switch to a default provider
        connectDefaultProvider();
      } else {
        toast(`Chain changed: ${chainId}`, {
          toastId: 'connected',
        });
        connect();
      }
    };

    const accountsChangedCallback = (accounts: string[]) => {
      if (!accounts.length) {
        toast('Account access revoked', { toastId: 'accessChanged' });
        // switch to a default provider
        connectDefaultProvider();
        // remove listeners
        setModalProvider(null);
      } else {
        toast('Account changed', { toastId: 'connected' });
        connect();
      }
    };
    const disconnectCallback = () => {
      toast('Account disconnected', { toastId: 'disconnected' });
      // switch to a default provider
      connectDefaultProvider();
      // remove listeners
      setModalProvider(null);
    };
    if (!modalProvider) return;

    // subscribe to chain events
    modalProvider.on('chainChanged', chainChangedCallback);

    // subscribe to account change events
    modalProvider.on('accountsChanged', accountsChangedCallback);

    // subscribe to provider disconnection
    modalProvider.on('disconnect', disconnectCallback);

    // unsubscribe
    return () => {
      if ((modalProvider as WalletConnectProvider).isWalletConnect) {
        modalProvider.off('accountsChanged', chainChangedCallback);
        modalProvider.off('chainChanged', chainChangedCallback);
        modalProvider.off('disconnect', disconnectCallback);
      } else {
        (modalProvider as ethers.providers.Web3Provider).removeAllListeners();
      }
    };
  }, [modalProvider, web3Modal, connectDefaultProvider, connect]);
};

export { useListeners };
