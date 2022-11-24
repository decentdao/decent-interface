import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/provider/types/index';
import { useTransaction } from '../../contexts/web3Data/transactions';
import useSafeContracts from '../safe/useSafeContracts';
import useBuildDAOTx from './useBuildDAOTx';

const useDeployDAO = () => {
  const { multiSendContract } = useSafeContracts();

  const [contractCallDeploy, contractCallPending] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const deployDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
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
    [build, contractCallDeploy, multiSendContract, t]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
