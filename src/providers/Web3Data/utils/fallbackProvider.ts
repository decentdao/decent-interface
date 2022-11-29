import { ethers, getDefaultProvider } from 'ethers';
import { BaseProviderInfo, ProviderApiKeys } from '../types';

/**
 * Creates a readonly provider connected to provided fallback chain
 */
export const getFallbackProvider = (): BaseProviderInfo => {
  const providerApiKeys: ProviderApiKeys = {};
  if (process.env.REACT_APP_INFURA_API_KEY)
    providerApiKeys.infura = process.env.REACT_APP_INFURA_API_KEY;
  if (process.env.REACT_APP_ALCHEMY_API_KEY)
    providerApiKeys.alchemy = process.env.REACT_APP_ALCHEMY_API_KEY;
  if (process.env.REACT_APP_ETHERSCAN_API_KEY)
    providerApiKeys.etherscan = process.env.REACT_APP_ETHERSCAN_API_KEY;

  const network = ethers.providers.getNetwork(
    parseInt(process.env.REACT_APP_FALLBACK_CHAIN_ID || '0', 10)
  );
  const defaultProvider = getDefaultProvider(network, providerApiKeys);

  return {
    provider: defaultProvider,
    signerOrProvider: defaultProvider,
    connectionType: 'readonly provider',
    network: defaultProvider.network.name,
    chainId: defaultProvider.network.chainId,
  };
};
