import { useState, ChangeEvent, FormEvent, useEffect } from "react";


import { useNavigate } from "react-router-dom";
import ConnectWalletToast from "../../components/DAOs/shared/ConnectWalletToast";
import ContentBox from "../../components/ui/ContentBox";
import { PrimaryButton } from "../../components/ui/forms/Button";
import Input from "../../components/ui/forms/Input";
import InputBox from "../../components/ui/forms/InputBox";
import H1 from "../../components/ui/H1";
import { useWeb3 } from "../../contexts/web3Data";
import useSearchDao from "../../hooks/useSearchDao";

function DAOSearch() {
  const [{ account }] = useWeb3();
  const navigate = useNavigate();

  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [searchAddr, setSearchAddr] = useState<string>();
  const { errorMessage, loading, address, addressIsDAO, validAddress, resetErrorState, updateSearchString } = useSearchDao();

  const searchOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetErrorState();
    setSearchAddr(event.target.value);
  };

  /**
   * search string is set inside useSearchDao hook which checks for validity and
   * if it matches an existing DAO
   *
   * @dev event.preventDefault() is called after setting search string,
   * otherwise the search string will not correctly set
   *
   * @param event
   */
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    updateSearchString(searchAddressInput!);
    event.preventDefault();
  };

  /**
   * handles navigation when valid address is submitted
   *
   */
  useEffect(() => {
    if (address && validAddress && addressIsDAO) {
      navigate(address!, { state: { validatedAddress: address } });
    }
  }, [navigate, address, validAddress, addressIsDAO]);

  useEffect(() => {
    if(searchAddr === undefined) {
      setSearchAddressInput("")
      return;
    }
    setSearchAddressInput(searchAddr)
  }, [searchAddr])

  return (
    <div>
      <ConnectWalletToast label="To search for a Fractal" />
      <H1>Find a Fractal</H1>
      <ContentBox>
        <form onSubmit={handleSearchSubmit}>
          <InputBox>
            <div className="flex items-center">
              <div className="flex-grow">
                <Input
                  value={searchAddressInput}
                  onChange={searchOnChange}
                  label="Address"
                  subLabel="Use a valid Fractal ETH address or ENS domain"
                  type="text"
                  errorMessage={errorMessage}
                />
              </div>

              <PrimaryButton type="submit" label="Search" isLoading={loading} disabled={!!errorMessage || loading || !searchAddressInput || !account} />
            </div>
          </InputBox>
        </form>
      </ContentBox>
    </div>
  );
}

export default DAOSearch;
