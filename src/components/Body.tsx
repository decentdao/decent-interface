import { Routes, Route } from 'react-router-dom';

import Home from './Home';
import DAOs from './DAOs/index';

function Body() {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
        <Route path="daos/*" element={<DAOs />} />
      </Routes>
    </div>
  )
}

export default Body;
