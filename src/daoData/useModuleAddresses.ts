import { useState, useEffect } from "react";

import { DAO, AccessControl } from "../typechain-types";

const useModuleAddresses = (
  daoContract: DAO | undefined,
  accessControlContract: AccessControl | undefined
) => {
  const [moduleAddresses, setModuleAddresses] = useState<string[]>();

  useEffect(() => {
    if (!daoContract || !accessControlContract) {
      setModuleAddresses(undefined);
      return;
    }

    const filter = accessControlContract.filters.ActionRoleAdded();

    accessControlContract
      .queryFilter(filter)
      .then((events) => {
        const addresses = events
          .map((event) => event.args.target);

        setModuleAddresses(addresses
          // Remove duplicate addresses
          .filter((address, index) => addresses.indexOf(address) === index)
          // Remove the DAO address
          .filter((address) => address !== daoContract.address));
      })
      .catch(console.error);
  }, [daoContract, accessControlContract]);

  return moduleAddresses;
};

export default useModuleAddresses;
