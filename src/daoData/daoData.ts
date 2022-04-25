import { useState } from 'react';

import useDAOContract from './useDAOContract';
import useDAOName from './useDAOName';
import useAccessControlAddress from './useAccessControlAddress';
import useAccessControlContract from './useAccessControlContract';
import useModuleAddresses from './useModuleAddresses';
import useProposals from './useProposals';
import { ProposalData } from './useProposals';

export interface DAOData {
  name: string | undefined,
  accessControlAddress: string | undefined,
  moduleAddresses: string[] | undefined,
  proposals: ProposalData[] | undefined,
};

export const useDAODatas = () => {
  const [daoAddress, setDAOAddress] = useState<string>();

  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);
  const accessControlAddress = useAccessControlAddress(daoContract);
  const accessControlContract = useAccessControlContract(accessControlAddress);
  const moduleAddresses = useModuleAddresses(daoContract, accessControlContract);
  const proposals = useProposals(moduleAddresses);

  const daoData: DAOData = {
    name,
    accessControlAddress,
    moduleAddresses,
    proposals
  };

  return [daoData, setDAOAddress] as const;
};
