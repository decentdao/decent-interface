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
import { NodeType } from '../../providers/fractal/constants/enums';

function MVDDAO() {
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

function GnosisDAO() {
  const {
    gnosis: { safe },
  } = useFractal();

  return (
    <div className="text-white">
      <div>address: {safe.address}</div>
      <div>nonce: {safe.nonce}</div>
      <div>threshold: {safe.threshold}</div>
      <div>owners: {safe.owners?.join(', ')}</div>
      <div>masterCopy: {safe.masterCopy}</div>
      <div>modules: {safe.modules?.join(', ')}</div>
      <div>fallbackHandler: {safe.fallbackHandler}</div>
      <div>guard: {safe.guard}</div>
      <div>version: {safe.version}</div>
    </div>
  );
}

function DAORoutes() {
  const {
    node: { node },
  } = useFractal();

  if (node.nodeType === NodeType.MVD) {
    return <MVDDAO />;
  } else if (node.nodeType === NodeType.GNOSIS) {
    return <GnosisDAO />;
  } else {
    return null;
  }
}

function DAO() {
  const {
    node: { node },
    mvd: { dao },
  } = useFractal();
  const navigate = useNavigate();
  useEffect(() => {
    if (!node.isLoading && node.nodeType === undefined) {
      navigate('/daos');
    }
  });
  if (node.isLoading) {
    // @todo add full page loader
    <div>LOADING DAO</div>;
  }

  return (
    <div>
      {node.nodeType === NodeType.MVD && dao.daoName !== undefined ? (
        <Helmet>
          <title>Fractal | {dao.daoName}</title>
        </Helmet>
      ) : (
        <Helmet>
          <title>Fractal</title>
        </Helmet>
      )}
      <DAORoutes />
    </div>
  );
}

export default DAO;
