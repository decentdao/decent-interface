import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

import useAddress from '../hooks/useAddress';

function ValidDAO({
  address,
}: {
  address: string,
}) {
  return (
    <div><span className="break-all">{address}</span> is a valid DAO!</div>
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
