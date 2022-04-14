import { Routes, Route, useParams } from 'react-router-dom';

import Summary from './Summary';
import Details from './Details';
import CreateProposal from './CreateProposal';

function DAOs() {
  const params = useParams();

  if (!params.address) {
    return <div>if you see this, it's a bug</div>
  }

  return (
    <Routes>
      <Route index element={<Summary />} />
      <Route path="details" element={<Details address={params.address} />} />
      <Route path="createproposal" element={<CreateProposal address={params.address} />} />
    </Routes>
  );
}

export default DAOs;