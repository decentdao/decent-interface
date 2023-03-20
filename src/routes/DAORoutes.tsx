import { Routes, Route } from 'react-router-dom';
import ProposalCreate from '../pages/ProposalCreate';
import ProposalDetails from '../pages/ProposalDetails';
import { Governance } from '../pages/Proposals';
import SubDaoCreate from '../pages/SubDaoCreate';
import Treasury from '../pages/Treasury';
import { DAO_ROUTES } from './constants';

export default function DAOSubRoutes() {
  return (
    <Routes>
      <Route
        path={DAO_ROUTES.newSubDao.path}
        element={<SubDaoCreate />}
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
