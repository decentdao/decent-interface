import { useState, useEffect } from "react";
import { GovernorModule, GovernorModule__factory } from "../typechain-types";
import { useWeb3 } from "../web3";

const useGovernorModuleContract = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const [{ signerOrProvider }] = useWeb3();

  useEffect(() => {
    if (
      moduleAddresses === undefined ||
      moduleAddresses[1] === undefined ||
      signerOrProvider === undefined
    ) {
      setGovernorModule(undefined);
      return;
    }

    setGovernorModule(
      GovernorModule__factory.connect(moduleAddresses[1], signerOrProvider)
    );
  }, [moduleAddresses, signerOrProvider]);

  return governorModule;
};

export default useGovernorModuleContract;
