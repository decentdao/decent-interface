import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { ConnectFn, ModalProvider } from '../types';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';

import { getSupportedChains, getChainsWithMetadata } from '../chains';
import { clearErrorContext, setLoggedWallet, setErrorContext } from '../../../helpers/errorLogging';
import { useTranslation } from 'react-i18next';

const useListeners = (
  web3Modal: Web3Modal,
  connectDefaultProvider: () => void,
  connect: ConnectFn
) => {
  const [modalProvider, setModalProvider] = useState<ModalProvider | null>(null);

  const supportedChains = getSupportedChains();
  const chainsNames = getChainsWithMetadata(supportedChains)
    .map(chain => chain.name)
    .join(', ');
  const { t } = useTranslation('menu');

  useEffect(() => {
    // subscribe to connect events
    web3Modal.on('connect', _modalProvider => {
      setLoggedWallet(_modalProvider.walletAddress);
      setErrorContext('chainId', _modalProvider.chainId);
      // check that connected chain is supported
      if (!supportedChains.includes(parseInt(_modalProvider.chainId))) {
        toast(t('toastSwitchChain', { chainsNames: chainsNames }), {
          toastId: 'switchChain',
        });
        // switch to a default provider
        connectDefaultProvider();
      } else {
        // if connected to Local provider don't enable listeners
        if (
          _modalProvider.chainId &&
          _modalProvider.chainId.toString() !== process.env.REACT_APP_LOCAL_CHAIN_ID
        ) {
          setModalProvider(_modalProvider);
        }
        toast(t('toastConnected'), { toastId: 'connected' });
      }
    });
    return () => {
      web3Modal.off('connect');
    };
  }, [web3Modal, connectDefaultProvider, supportedChains, chainsNames, t]);

  useEffect(() => {
    const chainChangedCallback = (chainId: string) => {
      setErrorContext('chainId', chainId);
      if (!getSupportedChains().includes(parseInt(chainId))) {
        // check that connected chain is supported
        toast(t('toastChainChangedUnsupported', { chainsNames: chainsNames }), {
          toastId: 'switchChain',
        });
        // switch to a default provider
        connectDefaultProvider();
      } else {
        toast(t('toastChainChanged', { chainId: chainId }), {
          toastId: 'connected',
        });
        connect();
      }
    };

    const accountsChangedCallback = (accounts: string[]) => {
      if (!accounts.length) {
        setLoggedWallet(null);
        toast(t('toastAccountRevoked'), { toastId: 'accessChanged' });
        // switch to a default provider
        connectDefaultProvider();
        // remove listeners
        setModalProvider(null);
      } else {
        setLoggedWallet(accounts[0]);
        toast(t('toastAccountChanged'), { toastId: 'connected' });
        connect();
      }
    };
    const disconnectCallback = () => {
      clearErrorContext();
      toast(t('toastAccountDisconnected'), { toastId: 'disconnected' });
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
  }, [modalProvider, web3Modal, connectDefaultProvider, connect, supportedChains, chainsNames, t]);
};

export { useListeners };
