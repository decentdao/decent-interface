import { Routes, Route } from 'react-router-dom';
import { DAO_ROUTES } from '../constants/routes';
import ProposalDetails from '../pages/ProposalDetails';
import SubDaoCreate from '../pages/SubDaoCreate';

export default function DAOSubRoutes() {
  return (
    <Routes>
      <Route
        path={DAO_ROUTES.newSubDao.path}
        element={<SubDaoCreate />}
      />
      <Route
        path={DAO_ROUTES.proposal.path}
        element={<ProposalDetails />}
      />
    </Routes>
  );
}
