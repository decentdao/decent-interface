import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import EtherscanLink from "../ui/EtherscanLink";
import useAddress from "../../hooks/useAddress";
import useIsDAO from "../../hooks/useIsDAO";
import SearchingDAO from "./SearchingDAO";
import { useDAOData } from "../../daoData";
import H1 from "../ui/H1";
import Button from "../ui/Button";

function ValidDAO({ address }: { address: string }) {
  const [showDetails, setShowDetails] = useState(false);

  if (showDetails) {
    return (
      <ValidDAODetails address={address} setShowDetails={setShowDetails} />
    );
  } else {
    return (
      <ValidDAOSummary address={address} setShowDetails={setShowDetails} />
    );
  }
}

function ValidDAOSummary({
  address,
  setShowDetails,
}: {
  address: string;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [{ name, accessControlAddress }, setDAOAddress] =
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
        is a valid dao!
      </H1>
      <div>
        <Button disabled={false} onClick={() => setShowDetails(true)}>
          DAO Details
        </Button>
        <div>name: {name}</div>
        <div>access control address: {accessControlAddress}</div>
      </div>
    </div>
  );
}

function ValidDAODetails({
  address,
  setShowDetails,
}: {
  address: string;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
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
        <Button disabled={false} onClick={() => setShowDetails(false)}>
          Back
        </Button>
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

function DAO() {
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

export default DAO;
