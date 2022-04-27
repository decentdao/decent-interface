import { Routes, Route } from 'react-router-dom';

import DAOSearch from './Search/DAOSearch';
import DAO from './DAO';
import New from './New';

function DAOs() {
  return (
    <Routes>
      <Route index element={<DAOSearch />} />
      <Route path="new" element={<New />} />
      <Route path=":address/*" element={<DAO />} />
    </Routes>
  );
}

export default DAOs;
