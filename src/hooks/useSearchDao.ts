import { useEffect, useState } from 'react';
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
    if (!searchString) {
      return;
    }
    if (loading !== false) {
      return;
    }
    if (!validAddress && address !== undefined) {
      setErrorMessage('Please use a valid Fractal MVD address, Gnosis Safe address, or ENS domain');
      return;
    }
    if (addressIsDAO === false && addressIsGnosisSafe === false) {
      setErrorMessage('Sorry neither a Fractal MVD nor a Gnosis Safe exists on this address');
      return;
    }
  }, [address, validAddress, searchString, addressIsDAO, addressIsGnosisSafe, loading]);

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
