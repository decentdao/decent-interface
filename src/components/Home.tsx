import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './ui/Button';
import { InputAddress } from './ui/Input';

function Home() {
  const [searchAddressInput, setSearchAddressInput] = useState("");
  const [searchDisabled, setSearchDisabled] = useState(true);
  useEffect(() => {
    setSearchDisabled(searchAddressInput.trim().length === 0);
  }, [searchAddressInput]);

  const navigate = useNavigate();
  const loadDAO = (address: string) => {
    navigate(address);
  }

  return (
    <div>
      <div className="mb-4">welcome to fractal</div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadDAO(searchAddressInput);
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
                onClick={() => loadDAO(searchAddressInput)}
              >
                load
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
