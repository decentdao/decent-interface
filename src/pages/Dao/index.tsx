import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Summary from '../../components/Dao/Summary';
import Dashboard from '../../components/Dao/Dashboard';
import { Modules } from '../../controller/Modules';
import Transactions from '../Transactions';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TreasuryController } from '../../controller/Modules/TreasuryController';
import { GovernanceController } from '../../controller/Modules/GovernanceController';
import { useTranslation } from 'react-i18next';

function DAORoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Summary />}
      />
      <Route
        path="dashboard/*"
        element={
          <GovernanceController>
            <TreasuryController>
              <Dashboard />
            </TreasuryController>
          </GovernanceController>
        }
      />
      <Route
        path="transactions/*"
        element={<Transactions />}
      />
      <Route
        path="modules/:moduleAddress/*"
        element={<Modules />}
      />
    </Routes>
  );
}

function DAO() {
  const {
    mvd: { dao },
  } = useFractal();
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    if (!dao.isLoading && !dao.daoAddress) {
      navigate('/daos');
    }
  });
  if (dao.isLoading) {
    // @todo add full page loader
    <div>{t('loading')}</div>;
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
