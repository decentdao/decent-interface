import { Routes, Route } from "react-router-dom";

import New from "./New";
import ProposalDetails from "./ProposalDetails";

function Proposals() {
  return (
    <Routes>
      <Route path="new" element={<New />} />
      <Route path=":proposalNumber/*" element={<ProposalDetails />} />
    </Routes>
  );
}

export default Proposals;
