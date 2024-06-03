import { normalize } from 'viem/ens';

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
 */
export const validateENSName = (ensAddress?: string): boolean => {
  if (!ensAddress) return false;

  const name = ensAddress.substring(0, ensAddress.lastIndexOf('.')).trim();
  const isValidLength = [...name].length >= 3;
  if (!isValidLength) return false;

  try {
    normalize(ensAddress);
    return true;
  } catch (e) {
    return false;
  }
};

export const networkPrefix: { [key: number]: string } = {
  1: 'eth',
  1115511: 'sep',
  10: 'oeth',
  8453: 'base',
  137: 'matic',
  84532: 'basesep',
};

export const addNetworkPrefix = (address: string, chainId: number): string => {
  return `${networkPrefix[chainId]}:${address}`;
};

export const networkIcons: { [key: number]: string } = {
  1: '/images/coin-icon-eth.svg',
  1115511: '/images/coin-icon-sep.svg',
  10: '/images/coin-icon-op.svg',
  8453: '/images/coin-icon-base.svg',
  137: '/images/coin-icon-pol.svg',
  84532: '/images/coin-icon-base-sep.svg',
};

export const getChainIdFromNetworkPrefix = (_networkPrefix: string): number => {
  return Number(
    Object.keys(networkPrefix).find(key => networkPrefix[parseInt(key)] === _networkPrefix),
  );
};

export const getNetworkIcon = (_networkPrefix: string): string => {
  const chainId = getChainIdFromNetworkPrefix(_networkPrefix);
  return networkIcons[chainId];
};
