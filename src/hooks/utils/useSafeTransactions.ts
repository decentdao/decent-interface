import { VetoGuard } from '@fractal-framework/fractal-contracts';
import {
  AllTransactionsListResponse,
  EthereumTxWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
  TransferWithTokenInfoResponse,
} from '@safe-global/safe-service-client';
import { constants, BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { useProvider } from 'wagmi';
import { checkIsApproved, checkIsRejected } from '../../helpers/activity';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  AssetTotals,
  GnosisTransferType,
  ActivityEventType,
  Activity,
  FractalProposalState,
} from '../../types';
import { formatWeiToValue, parseDecodedData } from '../../utils';
import { getTxQueuedTimestamp } from './useSafeActivitiesWithState';

export const useSafeTransactions = () => {
  const { nativeTokenSymbol } = useNetworkConfg();
  const provider = useProvider();
  const { guardContracts } = useFractal();

  type VetoGuardData = {
    guardTimelockPeriod: BigNumber;
    guardExecutionPeriod: BigNumber;
    lastBlock: ethers.providers.Block;
  };

  const getState = useCallback(
    async (activities: Activity[], vetoGuard?: VetoGuard, vetoGuardData?: VetoGuardData) => {
      if (vetoGuard && vetoGuardData) {
        const { guardTimelockPeriod, guardExecutionPeriod, lastBlock } = vetoGuardData;
        return Promise.all(
          activities.map(async (activity, _, activityArr) => {
            if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
              return activity;
            }

            if (activity.transaction.txType === 'MODULE_TRANSACTION') {
              return {
                ...activity,
                state: FractalProposalState.Module,
              };
            }

            const isMultiSigTransaction = activity.transaction.txType === 'MULTISIG_TRANSACTION';

            const multiSigTransaction =
              activity.transaction as SafeMultisigTransactionWithTransfersResponse;

            const eventNonce = multiSigTransaction.nonce;

            const isRejected = checkIsRejected(
              isMultiSigTransaction,
              activityArr,
              eventNonce,
              multiSigTransaction
            );

            const isApproved = checkIsApproved(multiSigTransaction);
            const queuedTimestamp = await getTxQueuedTimestamp(activity, vetoGuard);

            let state: FractalProposalState;

            if (multiSigTransaction.isExecuted) {
              state = FractalProposalState.Executed;
            } else if (queuedTimestamp === 0) {
              // Has not been queued
              if (isRejected) {
                state = FractalProposalState.Rejected;
              } else if (isApproved) {
                state = FractalProposalState.Queueable;
              } else {
                state = FractalProposalState.Active;
              }
            } else {
              // Has been Queued
              if (lastBlock.timestamp > queuedTimestamp + guardTimelockPeriod.toNumber()) {
                // Timelock has ended
                if (
                  lastBlock.timestamp <
                  queuedTimestamp + guardTimelockPeriod.toNumber() + guardExecutionPeriod.toNumber()
                ) {
                  // Within execution period
                  state = FractalProposalState.Executing;
                } else {
                  // Execution period has ended
                  state = FractalProposalState.Expired;
                }
              } else {
                // Within timelock period
                state = FractalProposalState.Queued;
              }
            }

            return { ...activity, state };
          })
        );
      } else {
        return activities.map((activity, _, activityArr) => {
          if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
            return activity;
          }

          if (activity.transaction.txType === 'MODULE_TRANSACTION') {
            return {
              ...activity,
              state: FractalProposalState.Module,
            };
          }

          const isMultiSigTransaction = activity.transaction.txType === 'MULTISIG_TRANSACTION';

          const multiSigTransaction =
            activity.transaction as SafeMultisigTransactionWithTransfersResponse;

          const eventNonce = multiSigTransaction.nonce;

          const isRejected = checkIsRejected(
            isMultiSigTransaction,
            activityArr,
            eventNonce,
            multiSigTransaction
          );

          const isApproved = checkIsApproved(multiSigTransaction);

          let state;
          if (isRejected) {
            state = FractalProposalState.Rejected;
          } else if (multiSigTransaction.isExecuted) {
            state = FractalProposalState.Executed;
          } else if (isApproved) {
            state = FractalProposalState.Executing;
          } else {
            state = FractalProposalState.Active;
          }
          return { ...activity, state };
        });
      }
    },
    []
  );

  const getTransferTotal = useCallback(
    (transfers: TransferWithTokenInfoResponse[]) => {
      return transfers.reduce(
        (prev: Map<string, AssetTotals>, cur: TransferWithTokenInfoResponse) => {
          if (cur.type === GnosisTransferType.ETHER && cur.value) {
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
          if (cur.type === GnosisTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
            prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
              bn: BigNumber.from(1),
              symbol: cur.tokenInfo.symbol,
              decimals: 0,
            });
          }
          if (cur.type === GnosisTransferType.ERC20 && cur.value && cur.tokenInfo) {
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
        new Map()
      );
    },
    [nativeTokenSymbol]
  );

  const parseTransactions = useCallback(
    async (transactions: AllTransactionsListResponse, daoAddress: string) => {
      if (!transactions.results.length) {
        return [];
      }

      const activities = await Promise.all(
        transactions.results.map((transaction, _, transactionArr) => {
          const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;
          const ethereumTransaction = transaction as EthereumTxWithTransfersResponse;

          const isMultiSigTransaction = transaction.txType === 'MULTISIG_TRANSACTION';
          const isModuleTransaction = transaction.txType === 'MODULE_TRANSACTION';

          // @note for ethereum transactions event these are the execution date
          const eventDate = new Date(
            multiSigTransaction.submissionDate || ethereumTransaction.executionDate
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
            }
          );

          // maps address for each transfer
          const transferAddresses = transaction.transfers.map(transfer =>
            transfer.to.toLowerCase() === daoAddress.toLowerCase() ? transfer.from : transfer.to
          );

          // @note this indentifies transaction a simple ETH transfer
          const isEthSend =
            isMultiSigTransaction &&
            !multiSigTransaction.data &&
            !multiSigTransaction.isExecuted &&
            !BigNumber.from(multiSigTransaction.value).isZero();

          if (isEthSend) {
            transferAmountTotals.push(
              `${formatWeiToValue(multiSigTransaction.value, 18)} ${nativeTokenSymbol}`
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

          const metaData =
            (isMultiSigTransaction || isModuleTransaction) && multiSigTransaction.dataDecoded
              ? {
                  decodedTransactions: parseDecodedData(
                    multiSigTransaction,
                    isMultiSigTransaction || isModuleTransaction
                  ),
                }
              : undefined;

          const targets = metaData
            ? [...metaData.decodedTransactions.map(tx => tx.target)]
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
            proposalNumber: eventSafeTxHash,
            targets,
            transactionHash: multiSigTransaction.transactionHash,
            metaData,
            state: null,
            nonce: eventNonce,
          };
          return activity;
        })
      );
      let vetoGuard: VetoGuard | undefined;
      let vetoGuardData: VetoGuardData | undefined;

      if (guardContracts.vetoGuardContract) {
        const blockNumber = await provider.getBlockNumber();
        vetoGuard = guardContracts.vetoGuardContract.asSigner as VetoGuard;
        vetoGuardData = {
          guardTimelockPeriod: await vetoGuard.timelockPeriod(),
          guardExecutionPeriod: await vetoGuard.executionPeriod(),
          lastBlock: await provider.getBlock(blockNumber),
        };
      }

      const activitiesWithState = await getState(activities, vetoGuard, vetoGuardData);
      return activitiesWithState;
    },
    [nativeTokenSymbol, provider, guardContracts, getTransferTotal, getState]
  );
  return { parseTransactions };
};
