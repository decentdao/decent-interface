import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { FractalProposal } from '../types';

export const isRejected = (
  activityArr: FractalProposal[],
  multiSigTransaction: SafeMultisigTransactionResponse,
) => {
  return activityArr.find(_activity => {
    const multiSigTx = _activity.transaction;
    return (
      multiSigTx &&
      multiSigTx.nonce === multiSigTransaction.nonce &&
      multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
      multiSigTx.isExecuted
    );
  });
};

export const isApproved = (multiSigTransaction: SafeMultisigTransactionResponse) => {
  return (
    (multiSigTransaction.confirmations?.length || 0) >= multiSigTransaction.confirmationsRequired
  );
};
