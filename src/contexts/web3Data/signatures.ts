import { ContractReceipt, ethers, Signature, Signer } from 'ethers';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { SafeSignature, safeSignMessage } from '../../controller/Modules/utils';
import { GnosisTransaction } from '../../providers/gnosis/types/gnosis';

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: any;
}

interface SigParams {
  signer: Signer;
  contractAddress: string;
  data: GnosisTransaction;
  pendingMessage: string;
  failedMessage: string;
  successMessage: string;
  failedCallback?: () => void;
  successCallback?: (signature: SafeSignature) => void;
  completedCallback?: () => void;
}

const useSignatures = () => {
  const [pending, setPending] = useState(false);
  const signatureCall = useCallback((params: SigParams) => {
    let toastId: React.ReactText;
    toastId = toast(params.pendingMessage, {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      progress: 1,
    });
    setPending(true);

    safeSignMessage(params.signer, params.contractAddress, params.data)
      .then((sigResponse: SafeSignature) => {
        const wait =
          process.env.NODE_ENV !== 'development'
            ? 0
            : process.env.REACT_APP_DEVELOPMENT_TX_WAIT_MS
            ? parseInt(process.env.REACT_APP_DEVELOPMENT_TX_WAIT_MS)
            : 0;

        return Promise.all([
          new Promise(resolve => setTimeout(() => resolve(null), wait)).then(() => sigResponse),
          toastId,
        ]);
      })
      .then(([signature, toastID]) => {
        toast.dismiss(toastID);
        if (signature === undefined) {
          toast.error(params.failedMessage);
          if (params.failedCallback) params.failedCallback();
        } else if (signature) {
          toast(params.successMessage);
          if (params.successCallback) params.successCallback(signature);
        } else {
          toast.error('Not sure what happened with that signature');
          if (params.failedCallback) params.failedCallback();
        }
        if (params.completedCallback) params.completedCallback();
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

  return [signatureCall, pending] as const;
};

export { useSignatures };
