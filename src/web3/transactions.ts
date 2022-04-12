import { ContractReceipt, ContractTransaction } from 'ethers';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export const useTransaction = () => {
  const contractCall = useCallback(
    (
      contractFn: () => Promise<ContractTransaction>,
      pendingMessage: string,
      failedMessage: string,
      successMessage: string,
      stoppedCallback?: () => void,
      waitingCallback?: () => void,
      completedCallback?: (txReceipt: ContractReceipt) => void,
      txnHashCallback?: (hash: string) => void
    ) => {
      let toastId: React.ReactText;
      contractFn()
        .then((txResponse: ContractTransaction) => {
          toast(
            pendingMessage,
          );
          if (waitingCallback) waitingCallback();
          return Promise.all([txResponse.wait(), toastId]);
        })
        .then(([txReceipt, toastId]) => {
          toast.dismiss(toastId);
          if (txReceipt.status === 0) {
            toast(failedMessage);
            if (stoppedCallback) stoppedCallback();
          } else if (txReceipt.status === 1) {
            toast(successMessage);
            if (waitingCallback) waitingCallback();
          } else {
            toast(failedMessage);
            if (stoppedCallback) stoppedCallback();
          }
          if (completedCallback) completedCallback(txReceipt);

          if (txnHashCallback) txnHashCallback(txReceipt.transactionHash);
        })
        .catch((error: ProviderRpcError) => {
          if (stoppedCallback) stoppedCallback();
          toast.dismiss(toastId);
          console.error(error);
          if (error.code !== 4001) {
            switch (error.code) {
              case 4100:
                toast(failedMessage);
                break;
              case 4200:
                toast(failedMessage);
                break;
              case 4900:
                toast(failedMessage);
                break;
              case 4901:
                toast(failedMessage);
                break;
            }
          } else {
            toast(failedMessage);
          }
        });
    },
    []
  );

  return { contractCall };
};