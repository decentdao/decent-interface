import { useState, ChangeEvent, FormEvent } from "react";

import H1 from "../../ui/H1";
import ContentBox from "../../ui/ContentBox";
import InputBox from "../../ui/forms/InputBox";
import Input from "../../ui/forms/Input";
import Button from "../../ui/Button";
import useSearchDao from "../../../hooks/useSearchDao";

function DAOSearch() {
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const { errorMessage, resetErrorState, updateSearchString } = useSearchDao();

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
                  subLabel="Use a Valid Fractual ETH Address or ENS domain"
                  type="text"
                  errorMessage={errorMessage}
                />
              </div>
              <Button
                type="submit"
                onClick={() => null}
                disabled={!searchAddressInput.trim()}
                addedClassNames="bg-gold-500 border-gold-500 rounded text-black-300 px-6 py-1 mx-2"
              >
                Search
              </Button>
            </div>
          </InputBox>
        </form>
      </ContentBox>
    </div>
  );
}

export default DAOSearch;
