import { useState } from 'react';

import useDAOContract from './useDAOContract';
import useDAOName from './useDAOName';
import useAccessControlAddress from './useAccessControlAddress';
import useAccessControlContract from './useAccessControlContract';
import useModuleAddresses from './useModuleAddresses';
import useGovernorModuleContract from './useGovernorModuleContract';
import useTokenContract from './useTokenContract';
import useTokenData from './useTokenData';
import useProposals from './useProposals';
import { ProposalData } from './useProposals';
import { GovernorModule, VotesTokenWithSupply } from '../typechain-types';

export interface DAOData {
  name: string | undefined,
  accessControlAddress: string | undefined,
  moduleAddresses: string[] | undefined,
  proposals: ProposalData[] | undefined,
  governorModuleContract: GovernorModule | undefined,
  tokenContract: VotesTokenWithSupply | undefined,
  tokenData: {
    name: string | undefined,
    symbol: string | undefined,
    decimals: number | undefined
    userBalance: number | undefined,
    delegatee: string | undefined,
  }
};

export const useDAODatas = () => {
  const [daoAddress, setDAOAddress] = useState<string>();

  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);
  const accessControlAddress = useAccessControlAddress(daoContract);
  const accessControlContract = useAccessControlContract(accessControlAddress);
  const moduleAddresses = useModuleAddresses(daoContract, accessControlContract);
  const governorModuleContract = useGovernorModuleContract(moduleAddresses);
  const tokenContract = useTokenContract(governorModuleContract);
  const tokenData = useTokenData(tokenContract);
  const proposals = useProposals(governorModuleContract);

  const daoData: DAOData = {
    name,
    accessControlAddress,
    moduleAddresses,
    proposals,
    governorModuleContract,
    tokenContract,
    tokenData
  };

  return [daoData, setDAOAddress] as const;
};
