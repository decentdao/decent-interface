import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from './useAddress';
import useIsDAO from './useIsDAO';

const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const [address, validAddress, addressLoading] = useAddress(searchString);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);
  const { t } = useTranslation('dashboard');

  /**
   * refresh error state if one exists
   *
   */
  const resetErrorState = () => {
    if (errorMessage) {
      setErrorMessage(undefined);
      setSearchString(undefined);
    }
  };

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
      setLoading(addressLoading || isDAOLoading);
    }
  }, [addressLoading, isDAOLoading]);

  /**
   * handles errors
   *
   * @dev loading or addressIsDao are initialized as undefined to indicate these processses
   * have not been ran yet.
   */
  useEffect(() => {
    if (!searchString) {
      return;
    }
    if (loading !== false) {
      return;
    }
    if (!validAddress && address !== undefined) {
      setErrorMessage(t('errorInvalidSearch'));
      return;
    }
    if (addressIsDAO === false) {
      setErrorMessage(t('errorFailedSearch'));
      return;
    }
  }, [address, validAddress, searchString, addressIsDAO, loading, t]);

  return {
    errorMessage,
    loading,
    address,
    addressIsDAO,
    validAddress,
    updateSearchString,
    resetErrorState,
  };
};

export default useSearchDao;
