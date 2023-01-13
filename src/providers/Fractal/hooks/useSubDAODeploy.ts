import { useCallback } from 'react';
import { useTransaction } from '../../../hooks/utils/useTransaction';

import { DeployDAOSuccessCallback, GnosisDAO, GovernanceTypes } from '../types';

export const useSubDAODeploy = () => {
  const [contractCallDeploy, deploySubDAOPending] = useTransaction();
  console.log(
    '🚀 ~ REMOVE WHEN IMPLEMENTED, This prevents warning for netlify',
    contractCallDeploy
  );
  const deploySubDao = useCallback(
    (daoData: GnosisDAO, successCallback: DeployDAOSuccessCallback) => {
      console.log(
        '🚀 ~ REMOVE WHEN IMPLEMENTED, This prevents warning for netlify',
        successCallback
      );
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
