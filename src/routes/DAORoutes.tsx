import { Routes, Route } from 'react-router-dom';
import useDAOController from '../hooks/DAO/useDAOController';
import { DaoDashboard } from '../pages/DaoDashboard';
import { FractalNodes } from '../pages/FractalNodes';
import ProposalCreate from '../pages/ProposalCreate';
import ProposalDetails from '../pages/ProposalDetails';
import { Governance } from '../pages/Proposals';
import SubDaoCreate from '../pages/SubDaoCreate';
import Treasury from '../pages/Treasury';
import { DAO_ROUTES } from './constants';

function DAOSubRoutes() {
  return (
    <Routes>
      <Route
        index
        element={<DaoDashboard />}
      />
      <Route
        path={DAO_ROUTES.newSubDao.path}
        element={<SubDaoCreate />}
      />
      <Route
        path={DAO_ROUTES.nodes.path}
        element={<FractalNodes />}
      />
      <Route
        path={DAO_ROUTES.treasury.path}
        element={<Treasury />}
      />
      <Route
        path={DAO_ROUTES.proposals.path}
        element={<Governance />}
      />
      <Route
        path={DAO_ROUTES.proposal.path}
        element={<ProposalDetails />}
      />
      <Route
        path={DAO_ROUTES.proposalNew.path}
        element={<ProposalCreate />}
      />
    </Routes>
  );
}

function DAORoutes() {
  useDAOController();
  return (
    <Routes>
      <Route
        path={DAO_ROUTES.dao.path}
        element={<DAOSubRoutes />}
      />
    </Routes>
  );
}

export default DAORoutes;
