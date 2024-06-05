import { Address } from 'viem';

export const decodePrefixedAddress = (address: string) => {
  const [prefix, addressWithoutPrefix] = address.split(':');
  if (!prefix || !addressWithoutPrefix) {
    throw new Error('Invalid address format');
  }
  return {
    network: prefix,
    address: addressWithoutPrefix,
  };
};

export const encodePrefixedAddress = (address: Address, network: string) => {
  return `${network}:${address}`;
};
