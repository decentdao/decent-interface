import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { useEffect, useState } from 'react';
import { Activity, ActivityEventType, TxProposalState } from '../../providers/Fractal/types';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

export function useSafeActivitiesWithState(
  activities: Activity[],
  vetoGuard: VetoGuard | undefined
) {
  const [activitiesWithState, setActivitiesWithState] = useState<Activity[]>([]);

  const {
    state: { provider },
  } = useWeb3Provider();

  useEffect(() => {
    if (vetoGuard) {
      Promise.all([vetoGuard.timelockPeriod(), vetoGuard.executionPeriod()]).then(
        ([timelockPeriod, executionPeriod]) => {
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

              const isQueueable =
                (multiSigTransaction.confirmations?.length || 0) >=
                multiSigTransaction.confirmationsRequired;

              // Get the txHash used by the VetoGuard since it is different than the one used by Gnosis Safe
              const vetoGuardTransactionHash = await vetoGuard.getTransactionHash(
                multiSigTransaction.to,
                multiSigTransaction.value,
                multiSigTransaction.data as string,
                multiSigTransaction.operation,
                multiSigTransaction.safeTxGas,
                multiSigTransaction.baseGas,
                multiSigTransaction.gasPrice,
                multiSigTransaction.gasToken,
                multiSigTransaction.refundReceiver as string
              );

              const queuedTimestamp = (
                await vetoGuard.getTransactionQueuedTimestamp(vetoGuardTransactionHash)
              ).toNumber();

              const lastBlockTimestamp = provider
                ? (await provider.getBlock(await provider.getBlockNumber())).timestamp
                : 0;

              let state: TxProposalState;

              if (isModuleTransaction) {
                state = TxProposalState.Module;
              } else if (multiSigTransaction.isExecuted) {
                state = TxProposalState.Executed;
              } else if (queuedTimestamp === 0) {
                // Has not been queued
                if (isRejected) {
                  state = TxProposalState.Rejected;
                } else if (isQueueable) {
                  state = TxProposalState.Queueable;
                } else {
                  state = TxProposalState.Active;
                }
              } else {
                // Has been Queued
                if (lastBlockTimestamp > queuedTimestamp + timelockPeriod.toNumber()) {
                  // Timelock has ended
                  if (
                    lastBlockTimestamp <
                    queuedTimestamp + timelockPeriod.toNumber() + executionPeriod.toNumber()
                  ) {
                    // Within execution period
                    state = TxProposalState.Executing;
                  } else {
                    // Execution period has ended
                    state = TxProposalState.Expired;
                  }
                } else {
                  // Within timelock period
                  state = TxProposalState.Queued;
                }
              }

              return { ...activity, state };
            })
          ).then(setActivitiesWithState);
        }
      );
    } else {
      // DAO does not have a VetoGuard
      setActivitiesWithState(
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

          const isApproved = multiSigTransaction.confirmations
            ? multiSigTransaction.confirmations?.length >= multiSigTransaction.confirmationsRequired
            : false;

          let state;
          if (isModuleTransaction) {
            state = TxProposalState.Module;
          } else if (isRejected) {
            state = TxProposalState.Rejected;
          } else if (multiSigTransaction.isExecuted) {
            state = TxProposalState.Executed;
          } else if (isApproved) {
            state = TxProposalState.Executing;
          } else {
            state = TxProposalState.Active;
          }
          return { ...activity, state };
        })
      );
    }
  }, [activities, provider, vetoGuard]);

  return activitiesWithState;
}
