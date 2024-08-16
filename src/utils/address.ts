import { JsonRpcProvider, FallbackProvider } from '@ethersproject/providers';
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

export const resolveAddress = async (
  addressOrENS: string,
  provider?: JsonRpcProvider | FallbackProvider,
): Promise<Address | null> => {
  let validAddress: Address;

  if (isAddress(addressOrENS)) {
    return addressOrENS;
  } else if (provider) {
    let resolvedAddress: string | null;
    resolvedAddress = await provider.resolveName(addressOrENS);

    if (resolvedAddress === null) {
      return null;
    }

    validAddress = getAddress(resolvedAddress);
  } else {
    throw new Error('No provider found');
  }

  return validAddress;
};
