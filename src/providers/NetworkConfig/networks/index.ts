import base from './base';
import mainnet from './mainnet';
import optimism from './optimism';
import polygon from './polygon';
import sepolia from './sepolia';

export const networks = { base, mainnet, optimism, polygon, sepolia };
export const validPrefixes = new Set(Object.values(networks).map(network => network.addressPrefix));
