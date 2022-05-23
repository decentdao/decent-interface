import { useEffect, useState } from "react";
import { TreasuryModule, TreasuryModule__factory } from "../../../typechain-types";
import { useWeb3 } from "../../web3Data";

const useTreasuryModuleContract = (moduleAddresses?: string[]) => {
  const [{ signerOrProvider }] = useWeb3();
  const [treasuryModule, setTreasuryModule] = useState<TreasuryModule>();

  useEffect(() => {
    if (moduleAddresses === undefined || !moduleAddresses.length || !moduleAddresses[0] || !signerOrProvider) {
      return;
    }
    setTreasuryModule(TreasuryModule__factory.connect(moduleAddresses[0], signerOrProvider));
  }, [moduleAddresses, signerOrProvider]);
  return treasuryModule;
};

export default useTreasuryModuleContract;
