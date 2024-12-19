import { normalize } from 'viem/ens';
import { supportedNetworks } from '../providers/NetworkConfig/useNetworkConfigStore';
export const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return !!url;
  } catch (e) {
    return false;
  }
};

/**
 * Tests whether the given string *could* be an ENS address.
 * Useful for preventing unnecessary resolver calls for strings that
 * aren't valid ENS names anyway.
 *
 */
export const validateENSName = (ensName?: string): boolean => {
  if (!ensName) return false;

  const name = ensName.substring(0, ensName.lastIndexOf('.')).trim();
  if ([...name].length < 3) return false;

  try {
    normalize(ensName);
    return true;
  } catch (e) {
    return false;
  }
};

export const addNetworkPrefix = (address: string, chainId: number): string => {
  const network = supportedNetworks.find(_network => _network.chain.id === chainId);
  if (!network) {
    throw new Error(`No network found for chainId ${chainId}`);
  }
  return `${network.addressPrefix}:${address}`;
};

export const getNetworkIcon = (_networkPrefix: string): string => {
  const network = supportedNetworks.find(_network => _network.addressPrefix === _networkPrefix);
  if (!network) {
    throw new Error(`No chain found for network prefix ${_networkPrefix}`);
  }
  return network.nativeTokenIcon;
};

export const getChainName = (_networkPrefix: string): string => {
  const network = supportedNetworks.find(_network => _network.addressPrefix === _networkPrefix);
  if (!network) {
    throw new Error(`No chain found for network prefix ${_networkPrefix}`);
  }
  return network.chain.name;
};

export const getChainIdFromPrefix = (_networkPrefix: string): number => {
  const network = supportedNetworks.find(_network => _network.addressPrefix === _networkPrefix);
  if (!network) {
    throw new Error(`No chain found for network prefix ${_networkPrefix}`);
  }
  return network.chain.id;
};
