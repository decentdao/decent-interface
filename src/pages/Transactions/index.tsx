import { Routes, Route, Navigate } from 'react-router-dom';
import H1 from '../../components/ui/H1';
import { GovernanceController } from '../../controller/Modules/GovernanceController';
import Plugins from './Plugins';

function Transactions() {
  return (
    <div>
      <H1>Transactions</H1>
      <Routes>
        <Route
          index
          element={
            <Navigate
              to="./.."
              replace={true}
            />
          }
        />
        <Route
          path="new"
          element={
            <GovernanceController>
              <Plugins />
            </GovernanceController>
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to="."
              replace={true}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default Transactions;
