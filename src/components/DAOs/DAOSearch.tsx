import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import Button from '../ui/Button';
import { InputAddress } from '../ui/Input';
import useAddress from '../../hooks/useAddress';
import useIsDAO from '../../hooks/useIsDAO';
import SearchingDAO from './SearchingDAO';
import H1 from '../ui/H1';

function FoundValidDAO({
  searchAddress,
  address,
}: {
  searchAddress: string | undefined,
  address: string | undefined,
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
}: {
  searchAddress: string | undefined,
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
    />
  )
}

function DAOSearch() {
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [searchAddress, setSearchAddress] = useState<string>();

  const doSearch = (address: string) => {
    setSearchAddress(address);
  }

  return (
    <div>
      <H1>Welcome to Fractal App</H1>
      <div>
        <div className="container mx-auto bg-slate-100 content-center px-32 p-8">
          <p className="text-center pb-2 text-lg">Find A Fractal</p>
          <p className="text-center pb-4">Use a valid Fractal ETH address or ENS domain</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch(searchAddressInput);
            }}
          >
            <div className="flex items-end">
              <div className="flex-grow">
                <InputAddress
                  title=""
                  value={searchAddressInput}
                  disabled={false}
                  placeholder=""
                  onChange={setSearchAddressInput}
                />
              </div>
              <div className="ml-2 mb-3">
                <Button
                  disabled={false}
                  onClick={() => doSearch(searchAddressInput)}
                >
                  search
                </Button>
              </div>
            </div>
          </form>
          <Search searchAddress={searchAddress} />
        </div>
      </div>
    </div >
  );
}

export default DAOSearch;
