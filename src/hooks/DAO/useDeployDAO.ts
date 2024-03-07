import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
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
    (
      daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
      successCallback: (daoAddress: string) => void,
    ) => {
      const deploy = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData);
        if (!builtSafeTx) {
          return;
        }

        const { predictedSafeAddress, safeTx } = builtSafeTx;

        contractCallDeploy({
          contractFn: () => multiSendContract.asSigner.multiSend(safeTx),
          pendingMessage: t('pendingDeploySafe'),
          failedMessage: t('failedDeploySafe'),
          successMessage: t('successDeploySafe'),
          successCallback: () => successCallback(predictedSafeAddress),
        });
      };

      deploy();
    },
    [build, contractCallDeploy, multiSendContract, t],
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
