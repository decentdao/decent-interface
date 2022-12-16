import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Web3Modal from 'web3modal';

import { clearErrorContext, setErrorContext, setLoggedWallet } from '../../../helpers/errorLogging';
import { getChainMetadataById, getChainsWithMetadata, getSupportedChains } from '../chains';
import { ConnectFn, ModalProvider } from '../types';

/**
 * Sets event listeners on wallet connection
 * if the wallet is connected to a local node or a fallback provider these listeners are not set
 * @param web3Modal
 * @param connectDefaultProvider
 * @param connect
 */
const useListeners = (
  web3Modal: Web3Modal,
  connectDefaultProvider: () => void,
  connect: ConnectFn
) => {
  const [modalProvider, setModalProvider] = useState<ModalProvider | null>(null);

  const supportedChains = getSupportedChains();
  const chainNames = getChainsWithMetadata(supportedChains)
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
        toast(t('toastSwitchChain', { chainNames: chainNames }), {
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
      }
    });
    return () => {
      web3Modal.off('connect');
    };
  }, [web3Modal, connectDefaultProvider, supportedChains, chainNames, t]);

  useEffect(() => {
    const chainChangedCallback = (chainId: string) => {
      setErrorContext('chainId', chainId);
      if (!getSupportedChains().includes(parseInt(chainId))) {
        // check that connected chain is supported
        toast(t('toastSwitchChain', { chainNames: chainNames }), {
          toastId: 'switchChain',
        });
        // switch to a default provider
        connectDefaultProvider();
      } else {
        toast(t('toastChainChanged', { chainName: getChainMetadataById(Number(chainId))?.name }), {
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
      toast(t('toastDisconnected'), { toastId: 'disconnected' });
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
  }, [modalProvider, web3Modal, connectDefaultProvider, connect, supportedChains, chainNames, t]);
};

export { useListeners };
