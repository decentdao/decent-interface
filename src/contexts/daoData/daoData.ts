import { useMemo, useState } from "react";
import { BigNumber } from "ethers";

import useDAOContract from "./useDAOContract";
import useDAOName from "./useDAOName";
import useAccessControlAddress from "./useAccessControlAddress";
import useAccessControlContract from "./useAccessControlContract";
import useModuleAddresses from "./useModuleAddresses";
import useGovernorModuleContract from "./useGovernorModuleContract";
import useTokenContract from "./useTokenContract";
import useTokenData from "./useTokenData";
import useProposals from "./useProposals";
import { ProposalData } from "./useProposals";
import { GovernorModule, VotesTokenWithSupply } from "../../typechain-types";
import { useBlockchainData } from "../blockchainData";

export interface DAOData {
  daoAddress: string | undefined;
  name: string | undefined;
  accessControlAddress: string | undefined;
  moduleAddresses: string[] | undefined;
  proposals: ProposalData[] | undefined;
  governorModuleContract: GovernorModule | undefined;
  tokenContract: VotesTokenWithSupply | undefined;
  tokenData: {
    name: string | undefined;
    symbol: string | undefined;
    decimals: number | undefined;
    userBalance: BigNumber | undefined;
    delegatee: string | undefined;
    votingWeight: BigNumber | undefined;
    address: string | undefined;
  };
  isDaoLoaded: boolean;
}

type SetDAOAddressFn = React.Dispatch<React.SetStateAction<string | undefined>>;
export type DAODataContext = readonly [DAOData, SetDAOAddressFn];

export const defaultDAODataResponse = [{} as DAOData, (() => undefined) as SetDAOAddressFn] as const;

const useDAODatas = () => {
  const [daoAddress, setDAOAddress] = useState<string>();
  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);
  const accessControlAddress = useAccessControlAddress(daoContract);
  const accessControlContract = useAccessControlContract(accessControlAddress);
  const moduleAddresses = useModuleAddresses(daoContract, accessControlContract);
  const governorModuleContract = useGovernorModuleContract(moduleAddresses);
  const tokenContract = useTokenContract(governorModuleContract);
  const tokenData = useTokenData(tokenContract);
  const { currentBlockNumber } = useBlockchainData();
  const proposals = useProposals(governorModuleContract, currentBlockNumber);
  // variable to track when dao contracts have finished loading
  const isDaoLoaded = useMemo(
    () => !!(daoAddress && accessControlAddress && accessControlContract && governorModuleContract && tokenContract),
    [daoAddress, accessControlAddress, accessControlContract, governorModuleContract, tokenContract]
  );
  const daoData: DAOData = {
    daoAddress,
    name,
    accessControlAddress,
    moduleAddresses,
    proposals,
    governorModuleContract,
    tokenContract,
    tokenData,
    isDaoLoaded,
  };

  return [daoData, setDAOAddress] as const;
};

export default useDAODatas;
