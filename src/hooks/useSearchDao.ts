import { useEffect, useState } from "react";
import useAddress from "./useAddress";
import useIsDAO from "./useIsDAO";
import { useNavigate } from "react-router";

const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const [address, validAddress, addressLoading] = useAddress(searchString);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);
  const navigate = useNavigate();

  /**
   * refresh error state if one exists
   *
   */
  const resetErrorState = () => {
    setLoading(false);
    if (errorMessage) {
      setErrorMessage(undefined);
      setSearchString(undefined);
    }
  };

  /**
   * updates search string when 'form' is submited
   *
   */
  const updateSearchString = (searchString: string) => {
    setSearchString(searchString);
  };

  /**
   * handles loading state of search
   */
  useEffect(() => {
    setLoading(addressLoading || isDAOLoading);
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
    if(loading !== false) {
      // @todo remove once button loader is added
      setErrorMessage("Loading...")
      return;
    }
    if (!validAddress && address !== undefined) {
      setErrorMessage("Please use a valid Fractal ETH address or ENS domain");
      return;
    }
    if (addressIsDAO === false) {
      setErrorMessage("Sorry a Fractal does not exist on this address");
      return;
    }
  }, [address, validAddress, searchString, addressIsDAO, loading]);

  /**
   * handles navigation when valid address is submitted
   *
   */
  useEffect(() => {
    if (address && validAddress && addressIsDAO) {
      navigate(address!, { state: { validatedAddress: address } });
    }
  }, [navigate, address, validAddress, addressIsDAO]);

  return {
    errorMessage,
    loading,
    updateSearchString,
    resetErrorState,
  };
};

export default useSearchDao;
