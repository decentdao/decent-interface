import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, getContract, isHex } from 'viem';
import { useWalletClient } from 'wagmi';
import MultiSendCallOnlyAbi from '../../assets/abi/MultiSendCallOnly';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { useTransaction } from '../utils/useTransaction';
import useBuildDAOTx from './useBuildDAOTx';

const useDeployDAO = () => {
  const [contractCall, pending] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const {
    addressPrefix,
    chain,
    contracts: { multiSendCallOnly },
  } = useNetworkConfigStore();

  const { data: walletClient } = useWalletClient({
    chainId: chain.id,
  });

  const deployDao = useCallback(
    (
      daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
      successCallback: (addressPrefix: string, safeAddress: Address, daoName: string) => void,
    ) => {
      const deploy = async () => {
        if (!walletClient) {
          return;
        }

        // ensure the chain is correct
        await walletClient.switchChain({
          id: chain.id,
        });

        if (walletClient.chain.id !== chain.id) {
          throw new Error('wallet client chain does not match network config');
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

        contractCall({
          contractFn: () => multiSendCallOnlyContract.write.multiSend([safeTx]),
          pendingMessage: t('pendingDeploySafe'),
          failedMessage: t('failedDeploySafe'),
          successMessage: t('successDeploySafe'),
          successCallback: () =>
            successCallback(addressPrefix, predictedSafeAddress, daoData.daoName),
        });
      };

      deploy();
    },
    [addressPrefix, build, chain.id, contractCall, multiSendCallOnly, t, walletClient],
  );

  return [deployDao, pending] as const;
};

export default useDeployDAO;
