import { useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";

import Summary from "./Summary";
import Details from "./Details";
import Proposals from "./Proposals";
import { useDAOData } from "../../../daoData";

function DAOs() {
  const params = useParams();
  const [, setAddress] = useDAOData();

  // when this component unloads, setAddress back to undefined to clear app state
  useEffect(() => () => setAddress(undefined), [setAddress]);

  if (!params.address) {
    return <div>if you see this, it's a bug</div>;
  }

  return (
    <Routes>
      <Route index element={<Summary />} />
      <Route path="details" element={<Details address={params.address} />} />
      <Route
        path="proposals/*"
        element={<Proposals address={params.address} />}
      />
    </Routes>
  );
}

export default DAOs;
