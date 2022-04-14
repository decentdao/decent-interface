import { Routes, Route } from 'react-router-dom';
import Summary from './Summary';

function DAOs() {
  return (
    <Routes>
      <Route index element={<Summary />} />
    </Routes>
  );
}

export default DAOs;