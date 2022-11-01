import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from './useAddress';
import useIsGnosisSafe from './useIsGnosisSafe';

const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const [address, validAddress, addressLoading] = useAddress(searchString);
  const [addressIsGnosisSafe, isGnosisSafeLoading] = useIsGnosisSafe(address);
  const { t } = useTranslation('dashboard');

  /**
   * refresh error state if one exists
   *
   */
  const resetErrorState = useCallback(() => {
    if (errorMessage) {
      setErrorMessage(undefined);
      setSearchString(undefined);
    }
  }, [errorMessage]);

  /**
   * updates search string when 'form' is submited
   *
   */
  const updateSearchString = (searchStr: string) => {
    setSearchString(searchStr);
  };

  /**
   * handles loading state of search
   */
  useEffect(() => {
    if (addressLoading !== undefined) {
      setLoading(addressLoading || isGnosisSafeLoading);
    }
  }, [addressLoading, isGnosisSafeLoading]);

  /**
   * handles errors
   *
   * @dev loading or addressIsDao are initialized as undefined to indicate these processses
   * have not been ran yet.
   */
  useEffect(() => {
    if (loading !== false) {
      return;
    }
    if (!address) {
      resetErrorState();
      return;
    }
    if (!validAddress && address !== undefined) {
      setErrorMessage(t('errorInvalidSearch'));
      return;
    }
    if (addressIsGnosisSafe === false) {
      setErrorMessage(t('errorFailedSearch'));
      return;
    }
  }, [
    address,
    validAddress,
    searchString,
    addressIsGnosisSafe,
    loading,
    t,
    resetErrorState,
  ]);

  return {
    errorMessage,
    loading,
    address,
    validAddress,
    updateSearchString,
    resetErrorState,
  };
};

export default useSearchDao;
