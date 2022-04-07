import { Routes, Route } from 'react-router-dom';

import DAOSearch from './DAOSearch';
import DAO from './DAO';
import New from './New';

function DAOs() {
  return (
    <div>
      <Routes>
        <Route index element={<DAOSearch />} />
        <Route path="new" element={<New />} />
        <Route path=":address" element={<DAO />} />
      </Routes>
    </div>
  )
}

export default DAOs;