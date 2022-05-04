import { Routes, Route, Navigate } from "react-router-dom";

import New from "./New";
import ProposalDetails from "./ProposalDetails";

function Proposals() {
  return (
    <Routes>
      <Route index element={<Navigate to="./.." replace={true} />} />
      <Route path="new" element={<New />} />
      <Route path=":proposalNumber/*" element={<ProposalDetails />} />
    </Routes>
  );
}

export default Proposals;
