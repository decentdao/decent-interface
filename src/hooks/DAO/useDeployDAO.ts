import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { useTransaction } from '../utils/useTransaction';
import useBuildDAOTx from './useBuildDAOTx';

const useDeployDAO = () => {
  const { baseContracts } = useFractal();

  const [contractCallDeploy, contractCallPending] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const { addressPrefix } = useNetworkConfig();

  const deployDao = useCallback(
    (
      daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
      successCallback: (addressPrefix: string, daoAddress: string) => void,
    ) => {
      const deploy = async () => {
        if (!baseContracts) {
          return;
        }

        const { multiSendContract } = baseContracts;

        const builtSafeTx = await build(daoData);
        if (!builtSafeTx) {
          return;
        }

        const { predictedSafeAddress, safeTx } = builtSafeTx;

        contractCallDeploy({
          contractFn: () => multiSendContract.asWallet.write.multiSend([safeTx]),
          pendingMessage: t('pendingDeploySafe'),
          failedMessage: t('failedDeploySafe'),
          successMessage: t('successDeploySafe'),
          successCallback: () => successCallback(addressPrefix, predictedSafeAddress),
        });
      };

      deploy();
    },
    [build, contractCallDeploy, baseContracts, t, addressPrefix],
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
