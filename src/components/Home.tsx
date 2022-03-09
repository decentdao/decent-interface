import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import Button from './ui/Button';
import { InputAddress } from './ui/Input';
import useAddress from '../hooks/useAddress';
import useIsDAO from '../hooks/useIsDAO';
import SearchingDAO from './SearchingDAO';

function FoundValidDAO({
  searchAddress,
  address,
}: {
  searchAddress: string | undefined,
  address: string | undefined,
}) {
  if (searchAddress !== undefined && address !== undefined) {
    return (
      <Navigate to={searchAddress} state={{ validatedAddress: address }} />
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

function Home() {
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [searchAddress, setSearchAddress] = useState<string>();

  const doSearch = (address: string) => {
    setSearchAddress(address);
  }

  return (
    <div>
      <div className="mb-4">welcome to fractal</div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSearch(searchAddressInput);
          }}
        >
          <div className="flex items-end">
            <div className="flex-grow">
              <InputAddress
                title="load a dao"
                value={searchAddressInput}
                disabled={false}
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
      </div>
      <Search searchAddress={searchAddress} />
    </div>
  );
}

export default Home;
