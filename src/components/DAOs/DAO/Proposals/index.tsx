import { Routes, Route, useParams } from "react-router-dom";

import New from "./New";
import ProposalsList from "./ProposalsList";

function Proposals({ address }: { address: string }) {
  const params = useParams();

  if (!params.address) {
    return <div>if you see this, it's a bug</div>;
  }

  return (
    <Routes>
      <Route index element={<ProposalsList address={address} />} />
      <Route path="new" element={<New address={address} />} />
    </Routes>
  );
}

export default Proposals;
