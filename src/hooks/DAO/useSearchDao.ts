import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { useIsSafe } from '../safe/useIsSafe';
import useAddress from '../utils/useAddress';

export const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  // This hook needs to search all supoorted chains for the address

  const { address, isValid, isLoading: isAddressLoading } = useAddress(searchString);
  const { isSafe, isSafeLoading, safeFoundNetworkPrefixes } = useIsSafe(address);
  const { t } = useTranslation('dashboard');
  const { chain } = useNetworkConfigStore();

  const isLoading = isAddressLoading === true || isSafeLoading === true;

  useEffect(() => {
    setErrorMessage(undefined);

    if (searchString === '' || isLoading || isSafe || isValid === undefined) {
      return;
    }
    if (isValid === true) {
      setErrorMessage(t('errorFailedSearch'));
    } else {
      setErrorMessage(t('errorInvalidSearch'));
    }
  }, [chain.name, isLoading, isSafe, isValid, searchString, t]);

  return {
    safeFoundNetworkPrefixes,
    errorMessage,
    isLoading,
    address,
    setSearchString,
    searchString,
  };
};
