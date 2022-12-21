import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { useEffect, useState } from 'react';
import { Activity, ActivityEventType, TxProposalState } from '../../providers/Fractal/types';

export function useSafeActivitiesWithState(
  activities: Activity[],
  vetoGuard: VetoGuard | undefined
) {
  const [activitiesWithState, setActivitiesWithState] = useState<Activity[]>([]);

  useEffect(() => {
    if (vetoGuard) {
      Promise.all(
        activities.map(async (activity, _, activityArr) => {
          if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
            return activity;
          }

          const isMultiSigTransaction = activity.transaction.txType === 'MULTISIG_TRANSACTION';
          const isModuleTransaction = activity.transaction.txType === 'MODULE_TRANSACTION';
          const multiSigTransaction =
            activity.transaction as SafeMultisigTransactionWithTransfersResponse;

          const eventNonce = multiSigTransaction.nonce;

          const isRejected =
            isMultiSigTransaction &&
            activityArr.find(_activity => {
              const multiSigTx =
                _activity.transaction as SafeMultisigTransactionWithTransfersResponse;
              return (
                multiSigTx.nonce === eventNonce &&
                multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
                multiSigTx.isExecuted
              );
            });

          // todo: move timelockPeriod and executionPeriod outside of array map
          const timelockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
          const executionPeriod = (await vetoGuard.executionPeriod()).toNumber();
          const queuedTimestamp = (
            await vetoGuard.getTransactionQueuedTimestamp(multiSigTransaction.safeTxHash)
          ).toNumber();
          const currentTimestamp = 0;

          let state: TxProposalState;

          if (isModuleTransaction) {
            state = TxProposalState.Module;
          } else if (queuedTimestamp === 0) {
            // Has not been queued
            if (isRejected) {
              state = TxProposalState.Rejected;
            } else {
              state = TxProposalState.Active;
            }
          } else {
            // Has been Queued
            if (multiSigTransaction.isExecuted) {
              state = TxProposalState.Executed;
            } else {
              // Not executed
              if (currentTimestamp > queuedTimestamp + timelockPeriod) {
                // Timelock has ended
                if (currentTimestamp < queuedTimestamp + timelockPeriod + executionPeriod) {
                  // Within execution period
                  state = TxProposalState.Pending;
                } else {
                  // Execution period has ended
                  state = TxProposalState.Expired;
                }
              } else {
                // Within timelock period
                state = TxProposalState.Queued;
              }
            }
          }

          return { ...activity, state };
        })
      ).then(setActivitiesWithState);
    } else {
      // DAO does not have a VetoGuard
      setActivitiesWithState(activities);

      activities.map((activity, _, activityArr) => {
        if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
          return activity;
        }

        const isMultiSigTransaction = activity.transaction.txType === 'MULTISIG_TRANSACTION';
        const isModuleTransaction = activity.transaction.txType === 'MODULE_TRANSACTION';
        const multiSigTransaction =
          activity.transaction as SafeMultisigTransactionWithTransfersResponse;

        const eventNonce = multiSigTransaction.nonce;

        const isRejected =
          isMultiSigTransaction &&
          activityArr.find(_activity => {
            const multiSigTx =
              _activity.transaction as SafeMultisigTransactionWithTransfersResponse;
            return (
              multiSigTx.nonce === eventNonce &&
              multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash &&
              multiSigTx.isExecuted
            );
          });

        let state;
        if (isModuleTransaction) {
          state = TxProposalState.Module;
        } else if (isRejected) {
          state = TxProposalState.Rejected;
        } else if (multiSigTransaction.isExecuted) {
          state = TxProposalState.Executed;
        } else if (multiSigTransaction.isSuccessful) {
          state = TxProposalState.Pending;
        } else {
          state = TxProposalState.Active;
        }
        return { ...activity, state };
      });
    }
  }, [activities, vetoGuard]);

  return activitiesWithState;
}
