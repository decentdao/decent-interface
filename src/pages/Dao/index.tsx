import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Summary, { GnosisDAOSummary } from '../../components/Dao/Summary';
import Dashboard from '../../components/Dao/Dashboard';
import { Modules } from '../../controller/Modules';
import Transactions from '../Transactions';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TreasuryController } from '../../controller/Modules/TreasuryController';
import { GovernanceController } from '../../controller/Modules/GovernanceController';
import { NodeType } from '../../providers/fractal/constants/enums';
import { useTranslation } from 'react-i18next';
import Proposals, { GnosisDAOProposals } from '../Proposals';
import { Governance } from '../Governance';

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
        path="proposals/*"
        element={<Proposals />}
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
  return (
    <Routes>
      <Route
        index
        element={<GnosisDAOSummary />}
      />
      <Route
        path="governance/*"
        element={<Governance isGnosisDAO={true} />}
      />
      <Route
        path="governance/proposals/*"
        element={<GnosisDAOProposals />}
      />
    </Routes>
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
  const { t } = useTranslation();
  useEffect(() => {
    if (node.isLoaded && node.nodeType === undefined) {
      navigate('/daos');
    }
  });
  if (!node.isLoaded) {
    // @todo add full page loader
    <div>{t('loading')}</div>;
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
