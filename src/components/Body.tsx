import { Routes, Route } from 'react-router-dom';

import Home from './Home';
import DAO from './DAO';

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
        <Route path=":address" element={<DAO />} />
      </Routes>
    </div>
  )
}

export default AppRoutes;
