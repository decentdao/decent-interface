import { ContractReceipt, ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { logError } from '../../helpers/errorLogging';

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: any;
}

interface ContractCallParams {
  contractFn: () => Promise<ethers.ContractTransaction>;
  pendingMessage: string;
  failedMessage: string;
  successMessage: string;
  failedCallback?: () => void;
  successCallback?: (txReceipt: ContractReceipt) => void;
  completedCallback?: () => void;
}

const useTransaction = () => {
  const [pending, setPending] = useState(false);
  const { t } = useTranslation(['transaction', 'common']);
  const contractCall = useCallback(
    (params: ContractCallParams) => {
      let toastId: React.ReactText;
      toastId = toast(params.pendingMessage, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        progress: 1,
      });
      setPending(true);
      params
        .contractFn()
        .then((txResponse: ethers.ContractTransaction) => {
          console.log('🚀 ~ file: useTransaction.ts:40 ~ txResponse:', txResponse);
          return Promise.all([txResponse.wait(), toastId]);
        })
        .then(([txReceipt, toastID]) => {
          console.log('🚀 ~ file: useTransaction.ts:50 ~ txReceipt:', txReceipt);
          toast.dismiss(toastID);
          if (txReceipt.status === 0) {
            toast.error(params.failedMessage);
            if (params.failedCallback) params.failedCallback();
          } else if (txReceipt.status === 1) {
            toast(params.successMessage);
            if (params.successCallback) params.successCallback(txReceipt);
          } else {
            toast.error(t('errorTransactionUnknown'));
            if (params.failedCallback) params.failedCallback();
          }
          if (params.completedCallback) params.completedCallback();

          // Give the block event emitter a couple seconds to play the latest
          // block on the app state, before informing app that the transaction
          // is completed.
          setTimeout(() => {
            setPending(false);
          }, 2000);
        })
        .catch((error: ProviderRpcError) => {
          logError(error);
          toast.dismiss(toastId);
          setPending(false);

          if (error.code === 4001) {
            toast.error(t('errorUserDeniedTransaction'));
            return;
          }

          toast.error(error.message, { autoClose: false });
        });
    },
    [t]
  );

  return [contractCall, pending] as const;
};

export { useTransaction };
