import { useState, useCallback } from 'react';
import { Address, createPublicClient, http, isAddress, getAddress } from 'viem';
import { normalize } from 'viem/ens';
import { supportedNetworks } from '../../providers/NetworkConfig/useNetworkConfigStore';

type ResolveAddressReturnType = {
  resolved: {
    address: Address;
    chainId: number;
  }[];
  isValid: boolean;
};
export const useResolveAddressMultiChain = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resolveAddressMultiChain = useCallback(
    async (input: string): Promise<ResolveAddressReturnType> => {
      setIsLoading(true);

      const returnedResult: ResolveAddressReturnType = {
        resolved: [],
        isValid: false,
      };

      if (input === '') {
        throw new Error('ENS name is empty');
      }

      if (isAddress(input)) {
        // @dev if its a valid address, its valid on all networks
        returnedResult.isValid = true;
        returnedResult.resolved = supportedNetworks.map(network => ({
          address: getAddress(input),
          chainId: network.chain.id,
        }));
        setIsLoading(false);
        return returnedResult;
      }

      // @dev if its not an address, try to resolve as possible ENS name on all networks
      let normalizedName: string;
      try {
        normalizedName = normalize(input);
      } catch {
        setIsLoading(false);
        return returnedResult;
      }
      const mainnet = supportedNetworks.find(network => network.chain.id === 1);
      if (!mainnet) {
        throw new Error('Mainnet not found');
      }

      const mainnetPublicClient = createPublicClient({
        chain: mainnet.chain,
        transport: http(mainnet.rpcEndpoint),
      });
      for (const network of supportedNetworks) {
        try {
          const resolvedAddress = await mainnetPublicClient.getEnsAddress({ name: normalizedName });
          if (resolvedAddress) {
            returnedResult.resolved.push({
              address: resolvedAddress,
              chainId: network.chain.id,
            });
            returnedResult.isValid = true;
          }
        } catch {
          // do nothing
        }
      }
      setIsLoading(false);
      return returnedResult;
    },
    [],
  );
  return { resolveAddressMultiChain, isLoading };
};
