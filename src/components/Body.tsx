import { Routes, Route } from 'react-router-dom';

import Home from '../components/Home';

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
      </Routes>
    </div>
  )
}

export default AppRoutes;
