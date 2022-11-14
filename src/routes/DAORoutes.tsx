import { Routes, Route } from 'react-router-dom';
import { DAOController } from '../controller/DAOs/DAOController';
import { DaoDashboard } from '../pages/DaoDashboard';
import { Delegate } from '../pages/Delegate';
import ProposalCreate from '../pages/ProposalCreate';
import ProposalDetails from '../pages/ProposalDetails';
import { Governance } from '../pages/Proposals';
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
        element={<div />}
      />
      <Route
        path={DAO_ROUTES.nodes.path}
        element={<div />}
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
      <Route
        path={DAO_ROUTES.delegate.path}
        element={<Delegate />}
      />
    </Routes>
  );
}

function DAORoutes() {
  return (
    <DAOController>
      <Routes>
        <Route
          path={DAO_ROUTES.dao.path}
          element={<DAOSubRoutes />}
        />
      </Routes>
    </DAOController>
  );
}

export default DAORoutes;
