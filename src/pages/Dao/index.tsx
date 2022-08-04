import { Routes, Route, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Summary from '../../components/Dao/Summary';
import { Modules } from '../../controller/Modules';
import Transactions from '../Transactions';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useEffect } from 'react';

function DAORoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Summary />}
      />
      <Route
        path="transactions/*"
        element={<Transactions />}
      />
      <Route
        path="modules/:moduleAddress"
        element={<Modules />}
      />
    </Routes>
  );
}

function DAO() {
  const { dao } = useFractal();
  const navigate = useNavigate();
  useEffect(() => {
    if (!dao.isLoading && !dao.daoAddress) {
      navigate('/daos');
    }
  });
  if (dao.isLoading) {
    // @todo add full page loader
    <div>LOADING DAO</div>;
  }

  if (!dao.daoAddress) {
    return null;
  }

  return (
    <div>
      {dao.daoName !== undefined && (
        <Helmet>
          <title>Fractal | {dao.daoName}</title>
        </Helmet>
      )}
      <DAORoutes />
    </div>
  );
}

export default DAO;
