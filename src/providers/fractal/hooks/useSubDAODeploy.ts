import { useCallback } from 'react';
import { useTransaction } from '../../../contexts/web3Data/transactions';

import { GnosisDAO, DeployDAOSuccessCallback, GovernanceTypes } from '../types';

export const useSubDAODeploy = () => {
  const [contractCallDeploy, deploySubDAOPending] = useTransaction();

  const deploySubDao = useCallback(
    (daoData: GnosisDAO, successCallback: DeployDAOSuccessCallback) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
        // return deployGnosisSafeWithUsul(daoData, successCallback);
        case GovernanceTypes.GNOSIS_SAFE:
        // return deployGnosisSafe(daoData, successCallback);
      }
    },
    []
  );
  return { deploySubDao, deploySubDAOPending };
};
