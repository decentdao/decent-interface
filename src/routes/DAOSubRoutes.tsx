import { Routes, Route } from 'react-router-dom';
import ProposalDetails from '../components/Proposals/ProposalDetails';
import { DAOController } from '../controller/DAOs/DAOController';
import { DaoDashboard } from '../pages/DaoDashboard';
import { Delegate } from '../pages/Delegate';
import ProposalCreate from '../pages/ProposalCreate';
import { Governance } from '../pages/Proposals';
import { DAO_ROUTES } from './constants';

function DAOSubRoutes() {
  return (
    <DAOController>
      <Routes>
        <Route
          index
          element={<DaoDashboard />}
        />
        <Route
          path={DAO_ROUTES.activties.path}
          element={<div />}
        />
        <Route
          path={DAO_ROUTES.treasury.path}
          element={<div />}
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
    </DAOController>
  );
}

export default DAOSubRoutes;
