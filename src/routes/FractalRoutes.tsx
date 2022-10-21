import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';

function FractalRoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Home />}
      />
      {/* <Route
        path="daos/*"
        element={<DAOs />}
      /> */}
    </Routes>
  );
}

export default FractalRoutes;
