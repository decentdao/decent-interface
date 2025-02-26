import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { getSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import {
  supportedEnsNetworks,
  supportedNetworks,
  useNetworkConfigStore,
} from '../../providers/NetworkConfig/useNetworkConfigStore';
import { useResolveENSName } from '../utils/useResolveENSName';

type ResolvedAddressWithChainId = {
  address: Address;
  chainId: number;
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

  const { getConfigByChainId } = useNetworkConfigStore();

  const findSafes = useCallback(
    async (resolvedAddressesWithChainId: { address: Address; chainId: number }[]) => {
      // We're going to call getSafeCreationInfo for each resolved address
      // If it throws, we don't have a Safe at that address
      // If it doesn't throw, we add the resolved address and chainId to our list
      const creationInfos = (
        await Promise.all(
          resolvedAddressesWithChainId.map(async resolved => {
            try {
              const safeAPI = getSafeAPI(getConfigByChainId(resolved.chainId));

              // if this throws, we don't have a Safe
              await safeAPI.getSafeCreationInfo(resolved.address);

              // We actually only care about returning the resolved address and chainId
              return resolved;
            } catch (e) {
              // Safe not found
              return null;
            }
          }),
        )
      ).filter(creationInfo => creationInfo !== null);

      // We're left with a list of chains and addresses
      // (all the same address) that have a Safe at that address.
      setSafeResolvedAddressesWithPrefix(creationInfos);
    },
    [getConfigByChainId],
  );

  const resolveInput = useCallback(
    async (input: string) => {
      setIsSafeLookupLoading(true);
      try {
        const resolvedAddressPromises = supportedEnsNetworks.map(async chainId => {
          const { resolvedAddress, isValid } = await resolveENSName(input, chainId);
          return isValid ? resolvedAddress : null;
        });

        const resolvedAddresses = (await Promise.all(resolvedAddressPromises)).filter(
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
            mappedAddressesWithChainIds.push({ address, chainId: network.chain.id });
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
