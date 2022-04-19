import { useEffect } from "react";

import EtherscanLink from "../../../ui/EtherscanLink";
import { useDAOData } from "../../../../daoData";
import H1 from "../../../ui/H1";

function ProposalsList({ address }: { address: string }) {
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
        Proposal List
      </H1>
    </div>
  );
}

export default ProposalsList;
