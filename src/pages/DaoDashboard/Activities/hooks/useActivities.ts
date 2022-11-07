import axios from 'axios';
import { BigNumber, constants } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { GnosisAction } from '../../../../providers/fractal/constants';
import { GnosisTransactionsResponse } from '../../../../providers/fractal/types';
import { buildGnosisApiUrl } from '../../../../providers/fractal/utils';
import { Activity, ActivityEventType, GnosisTransferType } from '../../../../types';
import { formatWeiToValue, getTimestampString } from '../../../../utils';
import { SortBy } from '../ActivitySort';
import { useWeb3Provider } from './../../../../contexts/web3Data/hooks/useWeb3Provider';
import { useFractal } from './../../../../providers/fractal/hooks/useFractal';

export const useActivities = (sortBy: SortBy) => {
  const {
    state: { chainId },
  } = useWeb3Provider();
  const {
    gnosis: { safe, transactions },
    dispatches: { gnosisDispatch },
  } = useFractal();

  const [sortedActivities, setSortedActivities] = useState<Activity[]>([]);
  const [parsedActivities, setParsedActivities] = useState<Activity[]>([]);
  const [isActivitiesLoading, setActivitiesLoading] = useState<boolean>(true);

  const parseActivities = useCallback(async () => {
    if (![...transactions.results].length || !safe) {
      return [];
    }
    setParsedActivities(
      await Promise.all(
        [...transactions.results].map(async transaction => {
          const isDeposit = transaction.transfers.every(
            t => t.to.toLowerCase() === safe.address!.toLowerCase()
          );

          /**
           * This returns a Mapping of the total amount of each token involved in the transfers
           * along with the symbol and decimals of those tokens
           */
          const transferAmountTotalsMap = transaction.transfers.reduce((prev, cur) => {
            if (cur.type === GnosisTransferType.ETHER && cur.value) {
              if (prev.has(constants.AddressZero)) {
                const prevValue = prev.get(constants.AddressZero);
                prev.set(constants.AddressZero, {
                  bn: prevValue.add(BigNumber.from(cur.value)),
                  symbol: 'ETHER',
                  decimals: 18,
                });
              }
              prev.set(constants.AddressZero, {
                bn: BigNumber.from(cur.value),
                symbol: 'ETHER',
                decimals: 18,
              });
            }
            if (cur.type === GnosisTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
              prev.set(cur.tokenAddress + cur.tokenId, {
                bn: BigNumber.from(1),
                symbol: cur.tokenInfo.symbol,
                decimals: 0,
              });
            }
            if (cur.type === GnosisTransferType.ERC20 && cur.value && cur.tokenInfo) {
              if (prev.has(cur.tokenInfo.address)) {
                const prevValue = prev.get(cur.tokenInfo.address);
                prev.set(cur.tokenInfo.address, {
                  ...prevValue,
                  bn: prevValue.bn.add(BigNumber.from(cur.value)),
                });
              } else {
                prev.set(cur.tokenAddress, {
                  bn: BigNumber.from(cur.value),
                  symbol: cur.tokenInfo.symbol,
                  decimals: cur.tokenInfo.decimals,
                });
              }
            }

            return prev;
          }, new Map());

          const transferAmountTotalsArr = Array.from(transferAmountTotalsMap.values()).map(
            token => {
              const totalAmount = formatWeiToValue(token.bn, token.decimals);
              const symbol = token.symbol;
              return `${totalAmount} ${symbol}`;
            }
          );
          const transferAddresses = transaction.transfers.map(transfer =>
            transfer.to.toLowerCase() === safe.address!.toLowerCase() ? transfer.from : transfer.to
          );

          return {
            transaction,
            eventDate: getTimestampString(new Date(transaction.executionDate)),
            eventType: ActivityEventType.Treasury,
            transferAddresses,
            transferAmountTotals: transferAmountTotalsArr,
            isDeposit,
          };
        })
      )
    );
  }, [safe, transactions]);

  const getGnosisSafeTransactions = useCallback(async () => {
    if (!safe.address) {
      return;
    }
    try {
      const { data } = await axios.get<GnosisTransactionsResponse>(
        buildGnosisApiUrl(chainId, `/safes/${safe.address}/all-transactions/`)
      );
      gnosisDispatch({
        type: GnosisAction.SET_SAFE_TRANSACTIONS,
        payload: data,
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safe, gnosisDispatch]);

  /**
   * Retreives data on load and dispatches to Fractal Provider
   */
  useEffect(() => {
    if (!transactions.results.length) {
      getGnosisSafeTransactions();
    }
  }, [getGnosisSafeTransactions, transactions]);

  /**
   * Parses returned data when retrieved for the dashboard activities
   */
  useEffect(() => {
    parseActivities();
  }, [transactions, parseActivities]);

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  useEffect(() => {
    const sortedTransactions = [...parsedActivities].sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
    setSortedActivities(sortedTransactions);
  }, [parsedActivities, sortBy]);

  /**
   * When data is ready, set loading to false
   */
  useEffect(() => {
    if (sortedActivities.length) {
      setActivitiesLoading(false);
    }
  }, [sortedActivities]);

  return { sortedActivities, isActivitiesLoading };
};
