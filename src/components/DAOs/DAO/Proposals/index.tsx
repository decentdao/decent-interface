import { Routes, Route, useParams } from 'react-router-dom';

import New from './New';

function Proposals({ address }: { address: string }) {
  const params = useParams();

  if (!params.address) {
    return <div>if you see this, it's a bug</div>
  }

  return (
    <Routes>
      <Route index element={<New address={address} />} />
      <Route path="new" element={<New address={address} />} />
    </Routes>
  );
}

export default Proposals;