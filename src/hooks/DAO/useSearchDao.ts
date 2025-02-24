import SafeApiKit from '@safe-global/api-kit';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import {
  supportedEnsNetworks,
  supportedNetworks,
} from '../../providers/NetworkConfig/useNetworkConfigStore';
import { useResolveENSName } from '../utils/useResolveENSName';

type ResolvedAddressWithChainId = {
  address: Address;
  chainId: number;
  safeBaseURL: string;
};
export const useSearchDao = () => {
  const { t } = useTranslation('dashboard');
  const { resolveENSName, isLoading: isAddressLoading } = useResolveENSName();
  const [searchString, setSearchString] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();

  const [isSafeLookupLoading, setIsSafeLookupLoading] = useState<boolean>(false);
  const [resolvedAddressesWithPrefix, setSafeResolvedAddressesWithPrefix] = useState<
    ResolvedAddressWithChainId[]
  >([]);

  const findSafes = useCallback(
    async (
      resolvedAddressesWithChainId: { address: Address; chainId: number; safeBaseURL: string }[],
    ) => {
      for await (const resolved of resolvedAddressesWithChainId) {
        const safeAPI = new SafeApiKit({
          chainId: BigInt(resolved.chainId),
          txServiceUrl: `${resolved.safeBaseURL}/api`,
        });
        safeAPI.getSafeCreationInfo(resolved.address);
        try {
          await safeAPI.getSafeCreationInfo(resolved.address);

          setSafeResolvedAddressesWithPrefix(prevState => [...prevState, resolved]);
        } catch (e) {
          // Safe not found
          continue;
        }
      }
    },
    [],
  );

  const resolveInput = useCallback(
    async (input: string) => {
      setIsSafeLookupLoading(true);
      try {
        const resolvePromises = supportedEnsNetworks.map(async chainId => {
          const { resolvedAddress, isValid } = await resolveENSName(input, chainId);
          return isValid ? resolvedAddress : null;
        });

        const resolvedAddresses = (await Promise.all(resolvePromises)).filter(
          address => address !== null,
        );

        if (resolvedAddresses.length === 0) {
          setErrorMessage('Invalid search');
          return;
        }

        const resolvedAddressesSet = new Set(resolvedAddresses);
        const mappedAddressesWithChainIds: ResolvedAddressWithChainId[] = [];

        for (const network of supportedNetworks) {
          for (const address of resolvedAddressesSet) {
            mappedAddressesWithChainIds.push({
              address,
              chainId: network.chain.id,
              safeBaseURL: network.safeBaseURL,
            });
          }
        }

        await findSafes(mappedAddressesWithChainIds);
      } catch (error) {
        setErrorMessage(t('errorInvalidSearch'));
      } finally {
        setIsSafeLookupLoading(false);
      }
    },
    [findSafes, resolveENSName, t],
  );

  useEffect(() => {
    setErrorMessage(undefined);
    setSafeResolvedAddressesWithPrefix([]);
    if (searchString === '') {
      return;
    }
    resolveInput(searchString).catch(() => setErrorMessage(t('errorInvalidSearch')));
  }, [resolveInput, searchString, t]);

  return {
    resolvedAddressesWithPrefix,
    errorMessage,
    isLoading: isAddressLoading || isSafeLookupLoading,
    setSearchString,
    searchString,
  };
};
