import { Routes, Route, Navigate } from "react-router-dom";

import ProposalDetails from "../../components/Proposals/ProposalDetails";
import ProposalCreate from "../ProposalCreate";

function Proposals() {
  return (
    <Routes>
      <Route index element={<Navigate to="./.." replace={true} />} />
      <Route path="new" element={<ProposalCreate />} />
      <Route path=":proposalNumber/*" element={<ProposalDetails />} />
    </Routes>
  );
}

export default Proposals;
