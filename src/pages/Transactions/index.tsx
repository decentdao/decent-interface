import { Routes, Route, Navigate } from 'react-router-dom';
import H1 from '../../components/ui/H1';
import New from './New';

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
          element={<New />}
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
