import { Routes, Route } from 'react-router-dom';

import Home from './Home';
import DAOs from './DAOs/index';

function Body() {
  return (
    <div className="container">
      <div className= "lg:px-36 py-20">
        <Routes>
          <Route index element={<Home />} />
          <Route path="daos/*" element={<DAOs />} />
        </Routes>
      </div>
    </div>
  )
}

export default Body;
