import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getContract, isHex } from 'viem';
import { useWalletClient } from 'wagmi';
import MultiSendCallOnlyAbi from '../../assets/abi/MultiSendCallOnly';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { useTransaction } from '../utils/useTransaction';
import useBuildDAOTx from './useBuildDAOTx';

const useDeployDAO = () => {
  const [, contractCallPending, contractCallDeployViem] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const {
    addressPrefix,
    contracts: { multisend: multiSendCallOnly },
  } = useNetworkConfig();

  const { data: walletClient } = useWalletClient();

  const deployDao = useCallback(
    (
      daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
      successCallback: (addressPrefix: string, daoAddress: string) => void,
    ) => {
      const deploy = async () => {
        if (!walletClient) {
          return;
        }

        const builtSafeTx = await build(daoData);
        if (!builtSafeTx) {
          return;
        }

        const { predictedSafeAddress, safeTx } = builtSafeTx;

        if (!isHex(safeTx)) {
          throw new Error('built transaction is not a hex string');
        }

        const multiSendCallOnlyContract = getContract({
          abi: MultiSendCallOnlyAbi,
          address: multiSendCallOnly,
          client: walletClient,
        });

        contractCallDeployViem({
          contractFn: () => multiSendCallOnlyContract.write.multiSend([safeTx]),
          pendingMessage: t('pendingDeploySafe'),
          failedMessage: t('failedDeploySafe'),
          successMessage: t('successDeploySafe'),
          successCallback: () => successCallback(addressPrefix, predictedSafeAddress),
        });
      };

      deploy();
    },
    [addressPrefix, build, contractCallDeployViem, multiSendCallOnly, t, walletClient],
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
