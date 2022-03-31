import { useState } from 'react';

import useDAOContract from './useDAOContract';
import useDAOName from './useDAOName';
import useAccessControlAddress from './useAccessControlAddress';

export interface DAOData {
  name: string | undefined,
  accessControlAddress: string | undefined,
};

export const useDAODatas = () => {
  const [daoAddress, setDAOAddress] = useState<string>();

  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);
  const accessControlAddress = useAccessControlAddress(daoContract);

  const daoData: DAOData = {
    name,
    accessControlAddress,
  };

  return [daoData, setDAOAddress] as const;
};
