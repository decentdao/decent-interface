import { MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionListResponse } from '@safe-global/api-kit';
import { useCallback } from 'react';
import { isApproved, isRejected } from '../../helpers/activity';
import { useFractal } from '../../providers/App/AppProvider';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { ActivityEventType, Activity, FractalProposalState } from '../../types';
import { parseDecodedData } from '../../utils';
import { getAverageBlockTime } from '../../utils/contract';
import { getTxTimelockedTimestamp } from '../../utils/guard';
import useSafeContracts from '../safe/useSafeContracts';
import { useSafeDecoder } from './useSafeDecoder';

type FreezeGuardData = {
  guardTimelockPeriodMs: bigint;
  guardExecutionPeriodMs: bigint;
  lastBlockTimestamp: number;
};

export const useSafeTransactions = () => {
  const provider = useEthersProvider();
  const { guardContracts } = useFractal();
  const baseContracts = useSafeContracts();
  const decode = useSafeDecoder();

  const getState = useCallback(
    async (
      activities: Activity[],
      freezeGuard?: MultisigFreezeGuard,
      freezeGuardData?: FreezeGuardData,
    ) => {
      if (freezeGuard && freezeGuardData && provider) {
        return Promise.all(
          activities.map(async (activity, _, activityArr) => {
            if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
              return activity;
            }

            const multiSigTransaction = activity.transaction;

            let state: FractalProposalState;

            if (multiSigTransaction.isExecuted) {
              // the transaction has already been executed
              state = FractalProposalState.EXECUTED;
            } else if (isRejected(activityArr, multiSigTransaction)) {
              // a different transaction with the same nonce has already
              // been executed, so this is no longer valid
              state = FractalProposalState.REJECTED;
            } else {
              // it's not executed or rejected, so we need to check the timelock status
              const timelockedTimestampMs =
                (await getTxTimelockedTimestamp(activity, freezeGuard, provider)) * 1000;
              if (timelockedTimestampMs === 0) {
                // not yet timelocked
                if (isApproved(multiSigTransaction)) {
                  // the proposal has enough signatures, so it can now be timelocked
                  state = FractalProposalState.TIMELOCKABLE;
                } else {
                  // not enough signatures on the proposal, it's still active
                  state = FractalProposalState.ACTIVE;
                }
              } else {
                // the proposal has been timelocked

                const timeLockPeriodEndMs =
                  timelockedTimestampMs + Number(freezeGuardData.guardTimelockPeriodMs);
                const nowMs = freezeGuardData.lastBlockTimestamp * 1000;
                if (nowMs > timeLockPeriodEndMs) {
                  // Timelock has ended, check execution period
                  const executionPeriodEndMs =
                    timeLockPeriodEndMs + Number(freezeGuardData.guardExecutionPeriodMs);
                  if (nowMs < executionPeriodEndMs) {
                    // Within execution period
                    state = FractalProposalState.EXECUTABLE;
                  } else {
                    // Execution period has ended
                    state = FractalProposalState.EXPIRED;
                  }
                } else {
                  // Still within timelock period
                  state = FractalProposalState.TIMELOCKED;
                }
              }
            }
            return { ...activity, state };
          }),
        );
      } else {
        return activities.map((activity, _, activityArr) => {
          if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
            return activity;
          }

          let state;
          if (activity.transaction.isExecuted) {
            state = FractalProposalState.EXECUTED;
          } else if (isRejected(activityArr, activity.transaction)) {
            state = FractalProposalState.REJECTED;
          } else if (isApproved(activity.transaction)) {
            state = FractalProposalState.EXECUTABLE;
          } else {
            state = FractalProposalState.ACTIVE;
          }
          return { ...activity, state };
        });
      }
    },
    [provider],
  );

  const parseTransactions = useCallback(
    async (transactions: SafeMultisigTransactionListResponse) => {
      if (!transactions.results.length || !provider) {
        return [];
      }

      const activities = await Promise.all(
        transactions.results.map(async (transaction, _, transactionArr) => {
          const eventDate = new Date(transaction.submissionDate);

          const eventSafeTxHash = transaction.safeTxHash;

          const eventType = ActivityEventType.Governance;

          const eventNonce = transaction.nonce;

          // @note identifies transactions with same nonce. this can be used to identify rejected transactions
          const noncePair = transactionArr.find(tx => {
            return tx.nonce === eventNonce && tx.safeTxHash !== transaction.safeTxHash;
          });

          const isMultisigRejectionTx: boolean | undefined =
            !transaction.data &&
            transaction.to === transaction.safe &&
            noncePair &&
            BigInt(transaction.value) === 0n;

          const confirmations = transaction.confirmations ?? [];

          const data = transaction.dataDecoded
            ? {
                decodedTransactions: parseDecodedData(transaction, true),
              }
            : {
                decodedTransactions: await decode(
                  transaction.value,
                  transaction.to,
                  transaction.data,
                ),
              };

          const targets = data
            ? [...data.decodedTransactions.map(tx => tx.target)]
            : [transaction.to];

          const activity: Activity = {
            transaction,
            eventDate,
            eventType,
            confirmations,
            signersThreshold: transaction.confirmationsRequired,
            multisigRejectedProposalNumber:
              isMultisigRejectionTx && !!noncePair ? noncePair.safeTxHash : undefined,
            proposalId: eventSafeTxHash,
            targets,
            // @todo typing for `multiSigTransaction.transactionHash` is misleading, as ` multiSigTransaction.transactionHash` is not always defined (if ever). Need to tighten up the typing here.
            // ! @todo This is why we are showing the two different hashes
            transactionHash: transaction.transactionHash ?? transaction.safeTxHash,
            data: data,
            state: null,
            nonce: eventNonce,
          };
          return activity;
        }),
      );
      let freezeGuard: MultisigFreezeGuard | undefined;
      let freezeGuardData: FreezeGuardData | undefined;

      if (guardContracts.freezeGuardContractAddress && baseContracts) {
        const blockNumber = await provider.getBlockNumber();
        const averageBlockTime = BigInt(Math.round(await getAverageBlockTime(provider)));
        freezeGuard = baseContracts.multisigFreezeGuardMasterCopyContract.asProvider.attach(
          guardContracts.freezeGuardContractAddress,
        );

        const timelockPeriod = BigInt(await freezeGuard.timelockPeriod());
        const executionPeriod = BigInt(await freezeGuard.executionPeriod());
        freezeGuardData = {
          guardTimelockPeriodMs: timelockPeriod * averageBlockTime * 1000n,
          guardExecutionPeriodMs: executionPeriod * averageBlockTime * 1000n,
          lastBlockTimestamp: (await provider.getBlock(blockNumber)).timestamp,
        };
      }

      const activitiesWithState = await getState(activities, freezeGuard, freezeGuardData);

      // todo: Some of these activities may be completed and can be cached
      return activitiesWithState;
    },
    [guardContracts, getState, decode, provider, baseContracts],
  );
  return { parseTransactions };
};
