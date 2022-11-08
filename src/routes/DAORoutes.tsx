import { Routes, Route } from 'react-router-dom';
import ProposalDetails from '../components/Proposals/ProposalDetails';
import { DAOController } from '../controller/DAOs/DAOController';
import { DaoDashboard } from '../pages/DaoDashboard';
import ProposalCreate from '../pages/ProposalCreate';
import { Governance } from '../pages/Proposals';
import { DAO_ROUTES } from './constants';

function DAORoutes() {
  return (
    <DAOController>
      <Routes>
        <Route
          index
          element={<DaoDashboard />}
        />
        <Route
          path={DAO_ROUTES.new.path}
          element={<div />}
        />
        <Route
          path={DAO_ROUTES.nodes.path}
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
      </Routes>
    </DAOController>
  );
}

export default DAORoutes;
