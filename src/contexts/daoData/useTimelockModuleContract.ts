import { useState, useEffect } from "react";
import { TimelockUpgradeable, TimelockUpgradeable__factory } from "../../typechain-types";
import { useWeb3 } from "../web3Data";

const useTimelockModuleContract = (moduleAddresses: string[] | undefined) => {
  const [timelockModule, setTimelockModule] = useState<TimelockUpgradeable>();
  const [{ signerOrProvider }] = useWeb3();

  useEffect(() => {
    if (
      moduleAddresses === undefined ||
      moduleAddresses[2] === undefined ||
      signerOrProvider === undefined
    ) {
      setTimelockModule(undefined);
      return;
    }

    setTimelockModule(
      TimelockUpgradeable__factory.connect(moduleAddresses[2], signerOrProvider)
    );
  }, [moduleAddresses, signerOrProvider]);

  return timelockModule;
};

export default useTimelockModuleContract;
