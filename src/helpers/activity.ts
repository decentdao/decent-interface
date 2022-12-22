import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { Activity } from '../providers/Fractal/types';

export const checkIsRejected = (
  isMultiSigTransaction: boolean,
  activityArr: Activity[],
  eventNonce: number,
  multiSigTransaction: SafeMultisigTransactionWithTransfersResponse
) => {
  return (
    isMultiSigTransaction &&
    activityArr.find(_activity => {
      const multiSigTx = _activity.transaction as SafeMultisigTransactionWithTransfersResponse;
      return (
        multiSigTx.nonce === eventNonce &&
        multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
        multiSigTx.isExecuted
      );
    })
  );
};

export const checkIsApproved = (
  multiSigTransaction: SafeMultisigTransactionWithTransfersResponse
) => {
  return (
    (multiSigTransaction.confirmations?.length || 0) >= multiSigTransaction.confirmationsRequired
  );
};
