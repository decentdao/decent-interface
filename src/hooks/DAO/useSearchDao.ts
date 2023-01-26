import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsGnosisSafe } from '../safe/useIsSafe';
import useAddress from '../utils/useAddress';

export const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { address, isValidAddress, isAddressLoading } = useAddress(searchString);
  const { isSafe, isSafeLoading } = useIsGnosisSafe(address);
  const { t } = useTranslation('dashboard');

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
        setErrorMessage(t('errorFailedSearch'));
      } else {
        setErrorMessage(t('errorInvalidSearch'));
      }
    }
  }, [address, isValidAddress, searchString, isSafe, t, isLoading, errorMessage]);

  return {
    errorMessage,
    isLoading,
    address,
    isSafe,
    setSearchString,
    searchString,
  };
};
