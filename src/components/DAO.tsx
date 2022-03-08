import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

import EtherscanLink from './ui/EtherscanLink';
import useAddress from '../hooks/useAddress';
import useIsDAO from '../hooks/useIsDAO';

function ValidDAO({
  address,
}: {
  address: string,
}) {
  const isDAO = useIsDAO(address);

  return (
    <div>
      <div>
        <EtherscanLink address={address}>
          <span className="break-all">{address}</span>
        </EtherscanLink> is a valid address!
      </div>
      <div>but is it a fractal dao? {isDAO !== undefined && isDAO.toString()}</div>
    </div>
  );
}

function SearchForDAO() {
  const params = useParams();
  const [address, , addressLoading] = useAddress(params.address);

  if (address !== undefined) {
    return (
      <ValidDAO address={address} />
    );
  }

  if (addressLoading === true) {
    return (
      <div>loading up <span className="break-all">{params.address}</span></div>
    );
  }

  return (
    <div>
      <div><span className="break-all">{params.address}</span> is an invalid address</div>
      <Link to="/">go back home</Link>
    </div>
  );
}

function DAO() {
  const location = useLocation();

  const [validatedAddress, setValidatedAddress] = useState<string>();
  useEffect(() => {
    if (!location || !location.state) {
      setValidatedAddress(undefined);
      return;
    }

    const locationState = location.state as { validatedAddress: string };
    setValidatedAddress(locationState.validatedAddress);
  }, [location]);

  if (validatedAddress) {
    return (
      <ValidDAO address={validatedAddress} />
    );
  }

  return (
    <SearchForDAO />
  );
}

export default DAO;
