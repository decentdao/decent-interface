import { Routes, Route } from 'react-router-dom';

import ProposalDetails from '../../components/Proposals/ProposalDetails';

export default function Proposals() {
  return (
    <Routes>
      <Route
        path=":proposalNumber/*"
        element={<ProposalDetails />}
      />
    </Routes>
  );
}
