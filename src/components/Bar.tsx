import { Routes, Route } from 'react-router-dom';

import Baz from './Baz';
import Qux from './Qux';

function Bar() {
  return (
    <div>
      <div>bar</div>
      <Routes>
        <Route path="baz" element={<Baz />} />
        <Route path="qux" element={<Qux />} />
      </Routes>
    </div>
  )
}

export default Bar;
