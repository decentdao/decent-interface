import { useState, useEffect } from "react";
import { Routes, Route, useParams, useLocation } from "react-router-dom";

import Summary from "./Summary";
import Details from "./Details";
import Proposals from "./Proposals";
import Delegate from "./Delegate";
import { useDAOData } from "../../../daoData";

import useAddress from "../../../hooks/useAddress";
import useIsDAO from "../../../hooks/useIsDAO";
import SearchingDAO from "../Search/SearchingDAO";

function DAORoutes() {
  const [, setAddress] = useDAOData();

  // when this component unloads, setAddress back to undefined to clear app state
  useEffect(() => () => setAddress(undefined), [setAddress]);

  return (
    <Routes>
      <Route index element={<Summary />} />
      <Route path="details" element={<Details />} />
      <Route path="delegate" element={<Delegate />} />
      <Route
        path="proposals/*"
        element={<Proposals />}
      />
    </Routes>
  );
}

function ValidDAO({ address }: { address: string }) {
  const [, setDAOAddress] = useDAOData();

  useEffect(() => {
    setDAOAddress(address);
  }, [address, setDAOAddress]);

  return (
    <DAORoutes />
  );
}

function FoundValidDAO({ address }: { address: string | undefined }) {
  if (address !== undefined) {
    return <ValidDAO address={address} />;
  }

  return <></>;
}

function Search() {
  const params = useParams();
  const [address, validAddress, addressLoading] = useAddress(params.address);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(addressLoading || isDAOLoading);
  }, [addressLoading, isDAOLoading]);

  return (
    <SearchingDAO
      searchAddress={params.address}
      loading={loading}
      validAddress={validAddress}
      address={address}
      addressIsDAO={addressIsDAO}
      validDAOComponent={<FoundValidDAO address={address} />}
    />
  );
}

function DAO() {
  const location = useLocation();

  const [validatedAddress, setValidatedAddress] = useState(
    (location.state as { validatedAddress: string } | null)?.validatedAddress
  );
  useEffect(() => {
    if (!location || !location.state) {
      setValidatedAddress(undefined);
      return;
    }

    const locationState = location.state as { validatedAddress: string };
    setValidatedAddress(locationState.validatedAddress);
  }, [location]);

  if (validatedAddress) {
    return <ValidDAO address={validatedAddress} />;
  }

  return <Search />;
}

export default DAO;
