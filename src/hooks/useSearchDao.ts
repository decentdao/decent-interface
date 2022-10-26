import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NodeType } from '../providers/fractal/constants/enums';
import useAddress from './useAddress';
import useIsDAO from './useIsDAO';
import useIsGnosisSafe from './useIsGnosisSafe';

const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const [address, validAddress, addressLoading] = useAddress(searchString);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);
  const [addressIsGnosisSafe, isGnosisSafeLoading] = useIsGnosisSafe(address);
  const [addressNodeType, setAddressNodeType] = useState<NodeType>();
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
      setLoading(addressLoading || isDAOLoading || isGnosisSafeLoading);
    }
  }, [addressLoading, isDAOLoading, isGnosisSafeLoading]);

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
    if (addressIsDAO === false && addressIsGnosisSafe === false) {
      setErrorMessage(t('errorFailedSearch'));
      return;
    }
  }, [
    address,
    validAddress,
    searchString,
    addressIsDAO,
    addressIsGnosisSafe,
    loading,
    t,
    resetErrorState,
  ]);

  useEffect(() => {
    if (addressIsDAO === true) {
      setAddressNodeType(NodeType.MVD);
      return;
    }

    if (addressIsGnosisSafe === true) {
      setAddressNodeType(NodeType.GNOSIS);
      return;
    }

    setAddressNodeType(undefined);
  }, [addressIsDAO, addressIsGnosisSafe]);

  return {
    errorMessage,
    loading,
    address,
    addressNodeType,
    validAddress,
    updateSearchString,
    resetErrorState,
  };
};

export default useSearchDao;
