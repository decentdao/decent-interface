import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

import Delegate from "../../components/DAOs/DAO/Delegate";
import Details from "../../components/DAOs/DAO/Details";
import Proposals from "../../components/DAOs/DAO/Proposals";
import Summary from "../../components/DAOs/DAO/Summary";
import { useDAOData } from "../../contexts/daoData";
import { useWeb3 } from "../../contexts/web3Data";
import useValidateDaoRoute from "../../hooks/useValidateDaoRoute";



function DAORoutes() {
  return (
    <Routes>
      <Route index element={<Summary />} />
      <Route path="details" element={<Details />} />
      <Route path="delegate" element={<Delegate />} />
      <Route path="proposals/*" element={<Proposals />} />
    </Routes>
  );
}

function ValidDAO({ address }: { address: string }) {
  const [{ name }, setDAOAddress] = useDAOData();

  useEffect(() => {
    setDAOAddress(address);
  }, [address, setDAOAddress]);

  return (
    <div>
      {name !== undefined && (<Helmet>
        <title>Fractal | {name}</title>
      </Helmet>)}
      <DAORoutes />
    </div>
  );
}

function DAO() {
  const location = useLocation();
  const navigate = useNavigate();
  const [{ account, accountLoading, chainId }] = useWeb3();
  const [, setAddress] = useDAOData();
  useValidateDaoRoute()
  const [validatedAddress, setValidatedAddress] = useState((location.state as { validatedAddress: string } | null)?.validatedAddress);
  useEffect(() => {
    if (!location || !location.state) {
      setValidatedAddress(undefined);
      return;
    }

    const locationState = location.state as { validatedAddress: string };
    setValidatedAddress(locationState.validatedAddress);
  }, [location]);

  useEffect(() => {
    if (account || accountLoading) {
      return;
    }

    navigate("/", { replace: true });
    toast("Connect a wallet to load a DAO");
  }, [account, accountLoading, navigate]);

  // when this component unloads, setAddress back to undefined to clear app state
  useEffect(() => () => setAddress(undefined), [setAddress]);
  // if network changes remove address validation.
  useEffect(() => () => setValidatedAddress(undefined), [chainId]);

  if (validatedAddress) {
    return <ValidDAO address={validatedAddress} />;
  }

  return <></>;
}

export default DAO;
