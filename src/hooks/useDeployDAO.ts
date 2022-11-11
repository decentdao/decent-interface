import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../contexts/web3Data/transactions';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from './../components/DaoCreator/provider/types/index';
import useBuildDAOTx from './useBuildDAOTx';
import useSafeContracts from './useSafeContracts';

type DeployDAOSuccessCallback = (daoAddress: string) => void;

const useDeployDAO = () => {
  const { multiSendContract } = useSafeContracts();

  const [contractCallDeploy, contractCallPending] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const deployGnosisSafeWithUsul = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: DeployDAOSuccessCallback) => {
      const deploy = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData);
        if (!builtSafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, safeTx } = builtSafeTx;

        contractCallDeploy({
          contractFn: () => multiSendContract.multiSend(safeTx),
          pendingMessage: t('pendingDeployGnosis'),
          failedMessage: t('failedDeployGnosis'),
          successMessage: t('successDeployGnosis'),
          successCallback: () => successCallback(predictedGnosisSafeAddress),
        });
      };

      deploy();
    },
    [multiSendContract, build, contractCallDeploy, t]
  );

  const deployGnosisSafe = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: DeployDAOSuccessCallback) => {
      const deploy = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData);
        if (!builtSafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, safeTx } = builtSafeTx;

        contractCallDeploy({
          contractFn: () => multiSendContract.multiSend(safeTx),
          pendingMessage: t('pendingDeployGnosis'),
          failedMessage: t('failedDeployGnosis'),
          successMessage: t('successDeployGnosis'),
          successCallback: () => successCallback(predictedGnosisSafeAddress),
        });
      };
      deploy();
    },
    [multiSendContract, build, contractCallDeploy, t]
  );

  const deployDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          return deployGnosisSafeWithUsul(daoData, successCallback);
        case GovernanceTypes.GNOSIS_SAFE:
          return deployGnosisSafe(daoData, successCallback);
      }
    },
    [deployGnosisSafe, deployGnosisSafeWithUsul]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
