import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { GnosisDAO, TokenGovernanceDAO } from '../../types';
import { useTransaction } from '../utils/useTransaction';
import useBuildDAOTx from './useBuildDAOTx';

const useDeployDAO = () => {
  const {
    baseContracts: { multiSendContract },
  } = useFractal();

  const [contractCallDeploy, contractCallPending] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const deployDao = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: (daoAddress: string) => void) => {
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
          contractFn: () => multiSendContract.asSigner.multiSend(safeTx),
          pendingMessage: t('pendingDeployGnosis'),
          failedMessage: t('failedDeployGnosis'),
          successMessage: t('successDeployGnosis'),
          successCallback: () => successCallback(predictedGnosisSafeAddress),
        });
      };

      deploy();
    },
    [build, contractCallDeploy, multiSendContract, t]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
