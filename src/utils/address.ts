import { Address, isAddress } from 'viem';

export const decodePrefixedAddress = (address: string) => {
  const [prefix, addressWithoutPrefix] = address.split(':');
  if (!prefix || !addressWithoutPrefix) {
    throw new Error('Invalid address format');
  }
  if (!isAddress(addressWithoutPrefix)) {
    throw new Error('Invalid address');
  }
  return {
    network: prefix,
    address: addressWithoutPrefix,
  };
};

export const encodePrefixedAddress = (address: Address, network: string) => {
  return `${network}:${address}`;
};

export const MOCK_MORALIS_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const SENTINEL_MODULE = '0x0000000000000000000000000000000000000001';
