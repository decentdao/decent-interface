import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

import EtherscanLink from "../../ui/EtherscanLink";
import useAddress from "../../../hooks/useAddress";
import useIsDAO from "../../../hooks/useIsDAO";
import SearchingDAO from "../SearchingDAO";
import { useDAOData } from "../../../daoData";
import H1 from "../../ui/H1";
import ProposalsList from "./Proposals/ProposalsList";

function ValidDAO({ address }: { address: string }) {
  const [{ name, accessControlAddress }, setDAOAddress] = useDAOData();

  useEffect(() => {
    setDAOAddress(address);
  }, [address, setDAOAddress]);

  return (
    <div>
      <H1>
        <EtherscanLink address={address}>
          <span className="break-all">{address}</span>
        </EtherscanLink>{" "}
        is a valid dao!
      </H1>
      <div>
        <div>
          <Link to="details" className="underline">
            DAO Details
          </Link>
        </div>
        <div>
          <Link to="proposals/new" className="underline">
            Create Proposal
          </Link>
        </div>
        <div>name: {name}</div>
        <div>access control address: {accessControlAddress}</div>
        <ProposalsList />
      </div>
    </div>
  );
}

function FoundValidDAO({ address }: { address: string | undefined }) {
  if (address !== undefined) {
    return <ValidDAO address={address} />;
  }

  return <></>;
}

function Search() {
  const params = useParams();
  const [address, validAddress, addressLoading] = useAddress(params.address);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(addressLoading || isDAOLoading);
  }, [addressLoading, isDAOLoading]);

  return (
    <SearchingDAO
      searchAddress={params.address}
      loading={loading}
      validAddress={validAddress}
      address={address}
      addressIsDAO={addressIsDAO}
      validDAOComponent={<FoundValidDAO address={address} />}
    />
  );
}

function Summary() {
  const location = useLocation();

  const [validatedAddress, setValidatedAddress] = useState(
    (location.state as { validatedAddress: string } | null)?.validatedAddress
  );
  useEffect(() => {
    if (!location || !location.state) {
      setValidatedAddress(undefined);
      return;
    }

    const locationState = location.state as { validatedAddress: string };
    setValidatedAddress(locationState.validatedAddress);
  }, [location]);

  if (validatedAddress) {
    return <ValidDAO address={validatedAddress} />;
  }

  return <Search />;
}

export default Summary;
