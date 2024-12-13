import SafeApiKit from '@safe-global/api-kit';
import { useCallback, useEffect, useState } from 'react';
import { isAddress } from 'viem';
import { supportedNetworks } from '../../providers/NetworkConfig/useNetworkConfigStore';

/**
 * A hook which determines whether the provided Ethereum address is a Safe
 * smart contract address on the currently connected chain (chainId).
 *
 * The state can be either true/false or undefined, if a network call is currently
 * being performed to determine that status.
 *
 * @param address the address to check
 * @returns isSafe: whether the address is a Safe,
 *  isSafeLoading: true/false whether the isSafe status is still being determined
 */
export const useIsSafe = (address: string | undefined) => {
  const [isSafeLoading, setSafeLoading] = useState<boolean>(false);
  const [isSafe, setIsSafe] = useState<boolean | undefined>(undefined);
  const [safeFoundNetworkPrefixes, setNetworkPrefixes] = useState<string[]>([]);

  const findSafes = useCallback(async (_address: string) => {
    const networkPrefixes = []; // address prefixes
    for await (const network of supportedNetworks) {
      const safeAPI = new SafeApiKit({ chainId: BigInt(network.chain.id) });
      safeAPI.getSafeCreationInfo(_address);
      try {
        await safeAPI.getSafeCreationInfo(_address);
        networkPrefixes.push(network.addressPrefix);
      } catch (e) {
        // Safe not found
        continue;
      }
    }
    return [networkPrefixes, networkPrefixes.length > 0] as const; // [networks, isSafe]
  }, []);

  useEffect(() => {
    setSafeLoading(true);
    setIsSafe(undefined);

    if (!address || !isAddress(address)) {
      setIsSafe(false);
      setSafeLoading(false);
      return;
    }

    findSafes(address)
      .then(([_safeFoundNetworkPrefixes, _isSafe]) => {
        setNetworkPrefixes(_safeFoundNetworkPrefixes);
        setIsSafe(_isSafe);
      })
      .catch(() => setIsSafe(false))
      .finally(() => setSafeLoading(false));
  }, [address, findSafes]);

  return { isSafe, isSafeLoading, safeFoundNetworkPrefixes };
};
