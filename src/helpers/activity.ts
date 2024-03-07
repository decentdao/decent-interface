import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { Activity } from '../types';
import { isMultiSigTx } from '../utils';

export const isRejected = (
  activityArr: Activity[],
  multiSigTransaction: SafeMultisigTransactionWithTransfersResponse,
) => {
  return (
    isMultiSigTx(multiSigTransaction) &&
    activityArr.find(_activity => {
      const multiSigTx = _activity.transaction as SafeMultisigTransactionWithTransfersResponse;
      return (
        multiSigTx.nonce === multiSigTransaction.nonce &&
        multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
        multiSigTx.isExecuted
      );
    })
  );
};

export const isApproved = (multiSigTransaction: SafeMultisigTransactionWithTransfersResponse) => {
  return (
    (multiSigTransaction.confirmations?.length || 0) >= multiSigTransaction.confirmationsRequired
  );
};
