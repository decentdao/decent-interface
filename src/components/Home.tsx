import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './ui/Button';
import { InputAddress } from './ui/Input';
import useQuery from '../hooks/useQuery';
import useAddress from '../hooks/useAddress';

function ValidSearch({
  queryAddress,
  validAddress,
  address,
  addressLoading,
}: {
  queryAddress: string | undefined,
  validAddress: boolean | undefined,
  address: string | undefined,
  addressLoading: boolean,
}) {
  if (validAddress === true) {
    return (
      <div>
        <div>this looks good!</div>
        <div>{address}</div>
      </div>
    );
  }

  if (validAddress === false) {
    return (
      <div>
        <span className="break-all">{queryAddress}</span> is an invalid address
      </div>
    );
  }

  if (addressLoading === true) {
    return (
      <div>
        looking up <span className="break-all">{queryAddress}</span>
      </div>
    );
  }

  return (
    <></>
  );
}

function Home() {
  const query = useQuery();
  const [queryAddress, setQueryAddress] = useState<string>();
  useEffect(() => {
    const q = query.get("q");

    if (q === null) {
      setQueryAddress(undefined);
      return;
    }

    setQueryAddress(q);
  }, [query]);

  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [lastSearch, setLastSearch] = useState("");
  useEffect(() => {
    const q = query.get("q");

    setSearchAddressInput(searchAddressInput => {
      if (q === null) {
        return searchAddressInput;
      }

      if (lastSearch !== q) {
        setLastSearch(q);
        return q;
      }

      return searchAddressInput;
    });
  }, [query, lastSearch]);

  const [address, validAddress, addressLoading] = useAddress(queryAddress);

  const [searchDisabled, setSearchDisabled] = useState(true);
  useEffect(() => {
    setSearchDisabled(
      searchAddressInput.trim().length === 0 ||
      addressLoading
    );
  }, [searchAddressInput, addressLoading]);

  const navigate = useNavigate();
  const setQuery = (address: string | undefined) => {
    navigate(`?q=${address}`)
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
      <ValidSearch
        queryAddress={queryAddress}
        validAddress={validAddress}
        address={address}
        addressLoading={addressLoading}
      />
    </div>
  );
}

export default Home;
