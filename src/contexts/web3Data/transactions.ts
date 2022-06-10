import { ContractReceipt, ethers } from 'ethers';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

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
  const contractCall = useCallback((params: ContractCallParams) => {
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
        const wait =
          process.env.NODE_ENV !== 'development'
            ? 0
            : process.env.REACT_APP_DEVELOPMENT_TX_WAIT_MS
            ? parseInt(process.env.REACT_APP_DEVELOPMENT_TX_WAIT_MS)
            : 0;

        return Promise.all([
          new Promise(resolve => setTimeout(() => resolve(null), wait)).then(() =>
            txResponse.wait()
          ),
          toastId,
        ]);
      })
      .then(([txReceipt, toastID]) => {
        toast.dismiss(toastID);
        if (txReceipt.status === 0) {
          toast.error(params.failedMessage);
          if (params.failedCallback) params.failedCallback();
        } else if (txReceipt.status === 1) {
          toast(params.successMessage);
          if (params.successCallback) params.successCallback(txReceipt);
        } else {
          toast.error('Not sure what happened with that transaction');
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
        console.error(error);
        toast.dismiss(toastId);
        setPending(false);

        if (error.code === 4001) {
          toast.error('User denied transaction');
          return;
        }

        toast.error("There was an error! Check your browser's console logs for more details.");
      });
  }, []);

  return [contractCall, pending] as const;
};

export { useTransaction };
