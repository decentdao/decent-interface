import SafeApiKit from '@safe-global/api-kit';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { useResolveAddressMultiChain } from '../utils/useResolveAddressMultiChain';

type ResolvedAddressWithPrefix = {
  address: Address;
  chainId: number;
};
export const useSearchDao = () => {
  const { t } = useTranslation('dashboard');
  const { resolveAddressMultiChain, isLoading: isAddressLoading } = useResolveAddressMultiChain();
  const [searchString, setSearchString] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();

  const [isSafeLookupLoading, setIsSafeLookupLoading] = useState<boolean>(false);
  const [resolvedAddressesWithPrefix, setSafeResolvedAddressesWithPrefix] = useState<
    ResolvedAddressWithPrefix[]
  >([]);

  const findSafes = useCallback(
    async (resolvedAddressesWithChainId: { address: Address; chainId: number }[]) => {
      setIsSafeLookupLoading(true);
      for await (const resolved of resolvedAddressesWithChainId) {
        const safeAPI = new SafeApiKit({ chainId: BigInt(resolved.chainId) });
        safeAPI.getSafeCreationInfo(resolved.address);
        try {
          await safeAPI.getSafeCreationInfo(resolved.address);

          setSafeResolvedAddressesWithPrefix(prevState => [...prevState, resolved]);
        } catch (e) {
          // Safe not found
          continue;
        }
      }
      setIsSafeLookupLoading(false);
    },
    [],
  );

  const resolveInput = useCallback(
    async (input: string) => {
      const { resolved, isValid } = await resolveAddressMultiChain(input);
      if (isValid) {
        await findSafes(resolved);
      } else {
        setErrorMessage('Invalid search');
      }
    },
    [findSafes, resolveAddressMultiChain],
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
