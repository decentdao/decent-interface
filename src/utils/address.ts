import { Address, getAddress, isAddress } from 'viem';

export const MOCK_MORALIS_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const SENTINEL_MODULE = '0x0000000000000000000000000000000000000001';

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

export const resolveAddress = async (addressOrENS: string, provider?: any): Promise<Address> => {
  let validAddress: Address;

  if (isAddress(addressOrENS)) {
    return addressOrENS;
  } else if (provider) {
    let resolvedAddress: string | null;
    try {
      resolvedAddress = await provider.resolveName(addressOrENS);
    } catch (e) {
      throw e;
    }

    if (resolvedAddress === null) {
      throw new Error('Given ENS name does not resolve to an address.');
    }

    validAddress = getAddress(resolvedAddress);
  } else {
    throw new Error('No provider found');
  }

  return validAddress;
};
