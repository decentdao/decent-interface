import { useState, useCallback, useEffect } from 'react';
import { useWeb3Provider } from './../../../../contexts/web3Data/hooks/useWeb3Provider';
import { useFractal } from './../../../../providers/fractal/hooks/useFractal';
import { SortBy } from '../ActivitySort';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber, constants } from 'ethers';
import { ActivityFilters, Activity, TreasuryActivityTypes } from '../../../../types';
import { formatWeiToValue, getTimestampString } from '../../../../utils';

export const useActivities = (
  filter: ActivityFilters[],
  sortBy: SortBy,
  ordering?: string,
  limit?: string,
  offset?: string
) => {
  console.log({
    offset,
    filter,
    sortBy,
    ordering,
    limit,
  });
  const {
    state: { provider },
  } = useWeb3Provider();
  const {
    gnosis: { safe, transactions },
  } = useFractal();

  const [parsedActivities, setParsedActivities] = useState<Activity[]>([]);

  const getAddressDisplay = useCallback(
    async (account: string) => {
      if (provider) {
        const ensName = await provider.lookupAddress(account);
        if (ensName) {
          return ensName;
        }
      }
      return `${account.substring(0, 8)}...${account.slice(-4)}`;
    },
    [provider]
  );

  const parseActivities = useCallback(async () => {
    const results = transactions.results;
    if (!results.length || !safe) {
      return [];
    }
    setParsedActivities(
      await Promise.all(
        results.map(async transaction => {
          const isDeposit = transaction.transfers.every(
            t => t.to.toLowerCase() === safe.address!.toLowerCase()
          );

          const transferAmountTotalsMap = transaction.transfers.reduce((prev, cur) => {
            if (cur.type === 'ETHER_TRANSFER' && cur.value) {
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
            if (cur.type === 'ERC721_TRANSFER' && cur.tokenInfo && cur.tokenId) {
              prev.set(cur.tokenAddress + cur.tokenId, {
                bn: BigNumber.from(1),
                symbol: cur.tokenInfo.symbol,
                decimals: 0,
              });
            }
            if (cur.type === 'ERC20_TRANSFER' && cur.value && cur.tokenInfo) {
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
          let transferAddressesDisplayArr = await Promise.all(
            transaction.transfers.map(async (transfer, i, arr) => {
              const addressOrName =
                arr.length > 1 && (i + 1) % 2 == 0
                  ? ' ' +
                    (await getAddressDisplay(
                      transfer.to === safe.address ? transfer.from : transfer.to
                    ))
                  : await getAddressDisplay(
                      transfer.to === safe.address ? transfer.from : transfer.to
                    );
              return addressOrName;
            })
          );

          let treasuryAcitivityType: TreasuryActivityTypes | undefined;

          return {
            transaction,
            eventDate: getTimestampString(new Date(transaction.executionDate)),
            eventType: 'Treasury',
            treasuryAcitivityType,
            transferAddresses: transferAddressesDisplayArr,
            transferAmountTotals: transferAmountTotalsArr,
            isDeposit,
          };
        })
      )
    );
  }, [transactions, safe, getAddressDisplay]);

  useEffect(() => {
    parseActivities();
  }, [parseActivities]);

  // handles filters
  // const filteredValues = useMemo<Activity[]>(() => {
  //   return [];
  // }, []);

  // handles sorting
  // const sortedValues = useMemo(() => {
  //   // if (transactions.results.length) {
  //   // }
  //   return;
  // }, []);

  useEffect(() => {
    // sets acitivites
  }, []);
  // @todo handle pagination? what is the limit? v2?

  return { parsedActivities };
};
