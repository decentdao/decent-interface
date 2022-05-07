import { Routes, Route } from 'react-router-dom';
import DAOSearch from '../../pages/DaoSearch';

import DAO from './DAO';
import DaoCreate from '../../pages/DaoCreate';

function DAOs() {
  return (
    <Routes>
      <Route index element={<DAOSearch />} />
      <Route path="new" element={<DaoCreate />} />
      <Route path=":address/*" element={<DAO />} />
    </Routes>
  );
}

export default DAOs;
