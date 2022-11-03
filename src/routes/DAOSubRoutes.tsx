import { Route, Routes } from 'react-router-dom';
import { DAOController } from '../controller/DAOs/DAOController';
import { DaoDashboard } from '../pages/DaoDashboard';
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
          element={<div />}
        />
        <Route
          path={DAO_ROUTES.proposal.path}
          element={<div />}
        />
        <Route
          path={DAO_ROUTES.proposalNew.path}
          element={<div />}
        />
      </Routes>
    </DAOController>
  );
}

export default DAOSubRoutes;
