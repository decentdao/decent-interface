import { Routes, Route } from 'react-router-dom';

import Baz from './Baz';
import Qux from './Qux';

function Foo() {
  return (
    <div>
      <div>foo</div>
      <Routes>
        <Route path="baz" element={<Baz />} />
        <Route path="qux" element={<Qux />} />
      </Routes>
    </div>
  )
}

export default Foo;
