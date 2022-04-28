import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import {InputAddress} from '../../ui/Input';
import useAddress from '../../../hooks/useAddress';
import useIsDAO from '../../../hooks/useIsDAO';
import SearchingDAO from './SearchingDAO';
import H1 from '../../ui/H1';
import ContentBox from '../../ui/ContentBox';
import InputBox from '../../ui/InputBox';
import SearchButton from '../../ui/SearchButton';

function FoundValidDAO({
  searchAddress,
  address,
}: {
  searchAddress: string | undefined;
  address: string | undefined;
}) {
  if (searchAddress !== undefined && address !== undefined) {
    return (
      <Navigate to={`${searchAddress}`} state={{ validatedAddress: address }} />
    );
  }
  return <></>;
}

function Search({
  searchAddress,
  setSearchFailed,
}: {
  searchAddress: string | undefined,
  setSearchFailed: React.Dispatch<React.SetStateAction<boolean>>,
}) {
  const [address, validAddress, addressLoading] = useAddress(searchAddress);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(addressLoading || isDAOLoading);
  }, [addressLoading, isDAOLoading]);

  return (
    <SearchingDAO
      searchAddress={searchAddress}
      loading={loading}
      validAddress={validAddress}
      address={address}
      addressIsDAO={addressIsDAO}
      validDAOComponent={<FoundValidDAO searchAddress={searchAddress} address={address} />}
      setSearchFailed={setSearchFailed}
    />
  );
}

function DAOSearch() {
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [searchAddress, setSearchAddress] = useState<string>();
  const [searchFailed, setSearchFailed] = useState<boolean>(false);

  const doSearch = (address: string) => {
    setSearchAddress(address);
  };

  return (
    <div>
      <H1>Find a Fractal</H1>
      <ContentBox>
        <InputBox label="Address">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch(searchAddressInput);
            }}
          >
            <div className="flex items-center">
              <div className="flex-grow">
                <InputAddress
                  value={searchAddressInput}
                  disabled={false}
                  placeholder=""
                  error={searchFailed}
                  onChange={setSearchAddressInput}
                />
              </div>
              <SearchButton />
            </div>
          </form>
          <Search
            setSearchFailed={setSearchFailed}
            searchAddress={searchAddress}
          />
        </InputBox>
      </ContentBox>
    </div>
  );
}

export default DAOSearch;
