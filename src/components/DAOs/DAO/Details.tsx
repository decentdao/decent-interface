import { useEffect } from "react";

import EtherscanLink from "../../ui/EtherscanLink";
import { useDAOData } from "../../../daoData";
import H1 from "../../ui/H1";

function Details({
  address,
}: {
  address: string;
}) {
  const [{ name, accessControlAddress, moduleAddresses }, setDAOAddress] =
    useDAOData();

  useEffect(() => {
    setDAOAddress(address);
  }, [address, setDAOAddress]);

  return (
    <div>
      <H1>
        <EtherscanLink address={address}>
          <span className="break-all">{address}</span>
        </EtherscanLink>{" "}
        Details
      </H1>
      <div>
        <div>name: {name}</div>
        <div>access control address: {accessControlAddress}</div>
        {moduleAddresses?.map((address, index) => (
          <div key={address}>
            Module {index}: {address}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Details;
