import { Routes, Route } from 'react-router-dom';

import App from '../components/structure/App'
import Home from '../components/Home';
import Foo from '../components/Foo';
import Bar from '../components/Bar';
import Baz from '../components/Baz';
import Qux from '../components/Qux';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="foo" element={<Foo />}>
          <Route path="baz" element={<Baz />} />
          <Route path="qux" element={<Qux />} />
        </Route>
        <Route path="bar" element={<Bar />}>
          <Route path="baz" element={<Baz />} />
          <Route path="qux" element={<Qux />} />
        </Route>
        <Route path="*" element={<div>go away</div>} />
      </Route>
    </Routes>
  )
}

export default AppRoutes;
