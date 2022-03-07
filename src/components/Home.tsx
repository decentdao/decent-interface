import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import Button from './ui/Button';
import { InputAddress } from './ui/Input';
import useAddress from '../hooks/useAddress';

function Searching({
  searchAddress,
  validAddress,
  addressLoading,
}: {
  searchAddress: string | undefined,
  validAddress: boolean | undefined,
  addressLoading: boolean,
}) {
  if (addressLoading === true) {
    return (
      <div>
        looking up <span className="break-all">{searchAddress}</span>
      </div>
    );
  }

  if (validAddress === false) {
    return (
      <div>
        <span className="break-all">{searchAddress}</span> is an invalid address
      </div>
    );
  }

  if (validAddress === true && searchAddress !== undefined) {
    return (
      <Navigate to={searchAddress} />
    );
  }

  return (
    <></>
  );
}

function Home() {
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [searchAddress, setSearchAddress] = useState<string>();
  const [, validAddress, addressLoading] = useAddress(searchAddress);

  const [searchDisabled, setSearchDisabled] = useState(true);
  useEffect(() => {
    setSearchDisabled(
      searchAddressInput.trim().length === 0 ||
      addressLoading
    );
  }, [searchAddressInput, addressLoading]);

  const setQuery = (address: string) => {
    setSearchAddress(address)
  }

  return (
    <div>
      <div className="mb-4">welcome to fractal</div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(searchAddressInput);
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
                disabled={searchDisabled}
                onClick={() => setQuery(searchAddressInput)}
              >
                search
              </Button>
            </div>
          </div>
        </form>
      </div>
      <Searching
        searchAddress={searchAddress}
        validAddress={validAddress}
        addressLoading={addressLoading}
      />
    </div>
  );
}

export default Home;
