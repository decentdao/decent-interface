import { Routes, Route, useParams } from "react-router-dom";

import New from "./New";
import ProposalDetails from "./ProposalDetails";

function Proposals({ address }: { address: string }) {
  const params = useParams();

  if (!params.address) {
    return <div>if you see this, it's a bug</div>;
  }

  return (
    <Routes>
      <Route path="new" element={<New address={address} />} />
      <Route path=":proposalNumber/*" element={<ProposalDetails />} />
    </Routes>
  );
}

export default Proposals;
