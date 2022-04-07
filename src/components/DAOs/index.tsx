import { Routes, Route } from 'react-router-dom';

import DAOSearch from './DAOSearch';
import DAO from './DAO';

function DAOs() {
  return (
    <div>
      <Routes>
        <Route index element={<DAOSearch />} />
        <Route path="new" element={<div>placeholder</div>} />
        <Route path=":address" element={<DAO />} />
      </Routes>
    </div>
  )
}

export default DAOs;