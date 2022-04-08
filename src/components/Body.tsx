import { Routes, Route } from 'react-router-dom';

import Home from './Home';
import DAOs from './DAOs/index';

function Body() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="daos/*" element={<DAOs />} />
    </Routes>
  )
}

export default Body;
