import { Routes, Route } from 'react-router-dom';

import Home from '../components/Home';
import Foo from '../components/Foo';
import Bar from '../components/Bar';

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
        <Route path="foo/*" element={<Foo />} />
        <Route path="bar/*" element={<Bar />} />
      </Routes>
    </div>
  )
}

export default AppRoutes;
