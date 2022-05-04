import { useState, ChangeEvent, FormEvent } from "react";

import H1 from "../../ui/H1";
import ContentBox from "../../ui/ContentBox";
import InputBox from "../../ui/forms/InputBox";
import Input from "../../ui/forms/Input";
import useSearchDao from "../../../hooks/useSearchDao";
import { PrimaryButton } from "../../ui/forms/Button";
import ConnectWalletToast from "../shared/ConnectWalletToast";
import { useWeb3 } from "../../../web3";

function DAOSearch() {
  const { account } = useWeb3();
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const { errorMessage, loading, resetErrorState, updateSearchString } = useSearchDao();

  const searchOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetErrorState();
    setSearchAddressInput(event.target.value);
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
    updateSearchString(searchAddressInput);
    event.preventDefault();
  };

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

              <PrimaryButton type="submit" label="Search" isLoading={loading} disabled={!!errorMessage || loading || !searchAddressInput.trim() || !account} />
            </div>
          </InputBox>
        </form>
      </ContentBox>
    </div>
  );
}

export default DAOSearch;
