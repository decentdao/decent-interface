import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

import Summary from '../../components/Dao/Summary';
import { useDAOData } from '../../contexts/daoData';
import useValidateDaoRoute from '../../hooks/useValidateDaoRoute';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { Modules } from '../../components/Modules';

function DAORoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Summary />}
      />
      <Route
        path="module/:moduleAddress"
        element={<Modules />}
      />
      {/* <Route
        path="governance"
        element={<Governance />}
      />
      <Route
        path="delegate"
        element={<Delegate />}
      />
      <Route
        path="treasury"
        element={<Treasury />}
      />
      <Route
        path="proposals/*"
        element={<Proposals />}
      />
      <Route
        path="transactions/*"
        element={<Transactions />}
      /> */}
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
      {name !== undefined && (
        <Helmet>
          <title>Fractal | {name}</title>
        </Helmet>
      )}
      <DAORoutes />
    </div>
  );
}

function DAO() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    state: { account, chainId, isProviderLoading },
  } = useWeb3Provider();
  const [, setAddress] = useDAOData();
  useValidateDaoRoute();
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

  useEffect(() => {
    if (account || isProviderLoading) {
      return;
    }

    navigate('/', { replace: true });
    toast('Connect a wallet to load a DAO');
  }, [account, navigate, isProviderLoading]);

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
