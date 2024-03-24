import { MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import {
  AllTransactionsListResponse,
  EthereumTxWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
  TransferWithTokenInfoResponse,
} from '@safe-global/safe-service-client';
import { constants, BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { isApproved, isRejected } from '../../helpers/activity';
import { useFractal } from '../../providers/App/AppProvider';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  AssetTotals,
  SafeTransferType,
  ActivityEventType,
  Activity,
  FractalProposalState,
} from '../../types';
import { formatWeiToValue, isModuleTx, isMultiSigTx, parseDecodedData } from '../../utils';
import { getAverageBlockTime } from '../../utils/contract';
import { getTxTimelockedTimestamp } from '../../utils/guard';
import useSafeContracts from '../safe/useSafeContracts';
import { useSafeDecoder } from './useSafeDecoder';

type FreezeGuardData = {
  guardTimelockPeriodMs: BigNumber;
  guardExecutionPeriodMs: BigNumber;
  lastBlock: ethers.providers.Block;
};

export const useSafeTransactions = () => {
  const { nativeTokenSymbol } = useNetworkConfig();
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
            if (isModuleTx(activity.transaction)) {
              return {
                ...activity,
                state: FractalProposalState.MODULE,
              };
            }

            const multiSigTransaction =
              activity.transaction as SafeMultisigTransactionWithTransfersResponse;

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
                  timelockedTimestampMs + freezeGuardData.guardTimelockPeriodMs.toNumber();
                const nowMs = freezeGuardData.lastBlock.timestamp * 1000;
                if (nowMs > timeLockPeriodEndMs) {
                  // Timelock has ended, check execution period
                  const executionPeriodEndMs =
                    timeLockPeriodEndMs + freezeGuardData.guardExecutionPeriodMs.toNumber();
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
          if (isModuleTx(activity.transaction)) {
            return {
              ...activity,
              state: FractalProposalState.MODULE,
            };
          }

          const multiSigTransaction =
            activity.transaction as SafeMultisigTransactionWithTransfersResponse;

          let state;
          if (multiSigTransaction.isExecuted) {
            state = FractalProposalState.EXECUTED;
          } else if (isRejected(activityArr, multiSigTransaction)) {
            state = FractalProposalState.REJECTED;
          } else if (isApproved(multiSigTransaction)) {
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

  const getTransferTotal = useCallback(
    (transfers: TransferWithTokenInfoResponse[]) => {
      return transfers.reduce(
        (prev: Map<string, AssetTotals>, cur: TransferWithTokenInfoResponse) => {
          if (cur.type === SafeTransferType.ETHER && cur.value) {
            const prevValue = prev.get(constants.AddressZero)!;
            if (prevValue) {
              prev.set(constants.AddressZero, {
                bn: prevValue.bn.add(BigNumber.from(cur.value)),
                symbol: nativeTokenSymbol,
                decimals: 18,
              });
            }
            prev.set(constants.AddressZero, {
              bn: BigNumber.from(cur.value),
              symbol: nativeTokenSymbol,
              decimals: 18,
            });
          }
          if (cur.type === SafeTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
            prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
              bn: BigNumber.from(1),
              symbol: cur.tokenInfo.symbol,
              decimals: 0,
            });
          }
          if (cur.type === SafeTransferType.ERC20 && cur.value && cur.tokenInfo) {
            const prevValue = prev.get(cur.tokenInfo.address);
            if (prevValue) {
              prev.set(cur.tokenInfo.address, {
                ...prevValue,
                bn: prevValue.bn.add(BigNumber.from(cur.value)),
              });
            } else {
              prev.set(cur.tokenAddress!, {
                bn: BigNumber.from(cur.value),
                symbol: cur.tokenInfo.symbol,
                decimals: cur.tokenInfo.decimals,
              });
            }
          }

          return prev;
        },
        new Map(),
      );
    },
    [nativeTokenSymbol],
  );

  const parseTransactions = useCallback(
    async (transactions: AllTransactionsListResponse, daoAddress: string) => {
      if (!transactions.results.length || !provider) {
        return [];
      }

      const activities = await Promise.all(
        transactions.results.map(async (transaction, _, transactionArr) => {
          const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;
          const ethereumTransaction = transaction as EthereumTxWithTransfersResponse;

          const isMultiSigTransaction = isMultiSigTx(transaction);
          const isModuleTransaction = isModuleTx(transaction);

          // @note for ethereum transactions event these are the execution date
          const eventDate = new Date(
            multiSigTransaction.submissionDate || ethereumTransaction.executionDate,
          );

          // @note it can be assumed that if there is no transfers it a receiving event
          const isDeposit: boolean = transaction.transfers.length
            ? transaction.transfers.every(t => t.to.toLowerCase() === daoAddress.toLowerCase())
            : false;

          // returns mapping of Asset -> Asset Total Value by getting the total of each asset transfered
          const transferAmountTotalsMap = getTransferTotal(transaction.transfers);

          // formats totals array into readable string with Symbol ie 1 [NativeSymbol]
          const transferAmountTotals: string[] = Array.from(transferAmountTotalsMap.values()).map(
            token => {
              const totalAmount = formatWeiToValue(token.bn, token.decimals);
              const symbol = token.symbol;
              return `${totalAmount} ${symbol}`;
            },
          );

          // maps address for each transfer
          const transferAddresses = transaction.transfers.map(transfer =>
            transfer.to.toLowerCase() === daoAddress.toLowerCase() ? transfer.from : transfer.to,
          );

          // @note this indentifies transaction a simple ETH transfer
          const isEthSend =
            isMultiSigTransaction &&
            !multiSigTransaction.data &&
            !multiSigTransaction.isExecuted &&
            !BigNumber.from(multiSigTransaction.value).isZero();

          if (isEthSend) {
            transferAmountTotals.push(
              `${formatWeiToValue(multiSigTransaction.value, 18)} ${nativeTokenSymbol}`,
            );
            transferAddresses.push(multiSigTransaction.to);
          }

          const eventSafeTxHash = multiSigTransaction.safeTxHash;

          const eventType: any = isMultiSigTransaction
            ? ActivityEventType.Governance
            : isModuleTransaction
              ? ActivityEventType.Module
              : ActivityEventType.Treasury;

          const eventNonce = multiSigTransaction.nonce;

          // @note identifies transactions with same nonce. this can be used to identify rejected transactions
          const noncePair = transactionArr.find(tx => {
            const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
            return (
              multiSigTx.nonce === eventNonce &&
              multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash
            );
          });

          const isMultisigRejectionTx: boolean | undefined =
            isMultiSigTransaction &&
            !multiSigTransaction.data &&
            multiSigTransaction.to === multiSigTransaction.safe &&
            noncePair &&
            BigNumber.from(multiSigTransaction.value).isZero();

          const confirmations = multiSigTransaction.confirmations
            ? multiSigTransaction.confirmations
            : [];

          const data =
            (isMultiSigTransaction || isModuleTransaction) && multiSigTransaction.dataDecoded
              ? {
                  decodedTransactions: parseDecodedData(
                    multiSigTransaction,
                    isMultiSigTransaction || isModuleTransaction,
                  ),
                }
              : {
                  decodedTransactions: await decode(
                    multiSigTransaction.value,
                    multiSigTransaction.to,
                    multiSigTransaction.data,
                  ),
                };

          const targets = data
            ? [...data.decodedTransactions.map(tx => tx.target)]
            : [transaction.to];

          const activity: Activity = {
            transaction,
            transferAddresses,
            transferAmountTotals,
            isDeposit,
            eventDate,
            eventType,
            confirmations,
            signersThreshold: multiSigTransaction.confirmationsRequired,
            multisigRejectedProposalNumber:
              isMultisigRejectionTx && !!noncePair
                ? (noncePair as SafeMultisigTransactionWithTransfersResponse).safeTxHash
                : undefined,
            proposalId: eventSafeTxHash,
            targets,
            transactionHash: multiSigTransaction.transactionHash,
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
        const averageBlockTime = BigNumber.from(Math.round(await getAverageBlockTime(provider)));
        freezeGuard = baseContracts.multisigFreezeGuardMasterCopyContract.asSigner.attach(
          guardContracts.freezeGuardContractAddress,
        );

        const timelockPeriod = BigNumber.from(await freezeGuard.timelockPeriod());
        const executionPeriod = BigNumber.from(await freezeGuard.executionPeriod());
        freezeGuardData = {
          guardTimelockPeriodMs: timelockPeriod.mul(averageBlockTime).mul(1000),
          guardExecutionPeriodMs: executionPeriod.mul(averageBlockTime).mul(1000),
          lastBlock: await provider.getBlock(blockNumber),
        };
      }

      const activitiesWithState = await getState(activities, freezeGuard, freezeGuardData);
      return activitiesWithState;
    },
    [
      guardContracts,
      getState,
      getTransferTotal,
      decode,
      nativeTokenSymbol,
      provider,
      baseContracts,
    ],
  );
  return { parseTransactions };
};
