import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useIsSafe } from '../safe/useIsSafe';
import useAddress from '../utils/useAddress';

export const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { address, isValidAddress, isAddressLoading } = useAddress(searchString);
  const { isSafe, isSafeLoading } = useIsSafe(address);
  const { t } = useTranslation('dashboard');
  const { name } = useNetworkConfig();

  useEffect(() => {
    setIsLoading(isAddressLoading === true || isSafeLoading === true);
  }, [isAddressLoading, isSafeLoading]);

  useEffect(() => {
    if (!searchString || isLoading) {
      setErrorMessage('');
      return;
    }

    if (isSafe) {
      setErrorMessage('');
    } else {
      if (isValidAddress) {
        setErrorMessage(t('errorFailedSearch', { chain: name }));
      } else {
        setErrorMessage(t('errorInvalidSearch'));
      }
    }
  }, [isLoading, isSafe, isValidAddress, name, searchString, t]);

  return {
    errorMessage,
    isLoading,
    address,
    isSafe,
    setSearchString,
    searchString,
  };
};
