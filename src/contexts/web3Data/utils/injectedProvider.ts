import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { InjectedProviderInfo, LocalInjectedProviderInfo, Web3ModalProvider } from '../types';
import { localProviderAsSigner } from './localProvider';

/**
 * Creates a injected provider connected to a wallet provider
 */
export const makeInjectedProvider = async (
  web3Provider: ethers.providers.Web3Provider
): Promise<InjectedProviderInfo> => {
  const local =
    process.env.REACT_APP_LOCAL_CHAIN_ID &&
    (await web3Provider.getNetwork()).chainId ===
      parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID, 10);

  const signer = web3Provider.getSigner();
  return {
    account: await signer.getAddress(),
    signerOrProvider: signer,
    provider: web3Provider,
    connectionType: 'injected provider',
    network: local ? 'localhost' : (await web3Provider.getNetwork()).name,
    chainId: (await web3Provider.getNetwork()).chainId,
  };
};

/**
 * Creates a injected provider connected to a wallet provider or local provider
 * if the connecting chain is to a local node creates and returns a local provider connected as a Signer
 */
export const getInjectedProvider = async (
  web3ModalProvider: Web3Modal
): Promise<InjectedProviderInfo | LocalInjectedProviderInfo | undefined> => {
  const userSuppliedProvider: Web3ModalProvider = await web3ModalProvider.connect();
  if (userSuppliedProvider.chainId.toString() === process.env.REACT_APP_LOCAL_CHAIN_ID) {
    const localProvider = await localProviderAsSigner();
    if (localProvider) {
      return localProvider;
    }
    return undefined;
  }
  return makeInjectedProvider(
    new ethers.providers.Web3Provider(userSuppliedProvider as ethers.providers.ExternalProvider)
  );
};
