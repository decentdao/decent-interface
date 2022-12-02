import {
  TransferWithTokenInfoResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@gnosis.pm/safe-service-client';
import { constants, BigNumber } from 'ethers';
import { useCallback } from 'react';
import { GnosisTransferType } from '../../../../types';
export const useActivityParser = () => {
  const totalsReducer = useCallback((prev: Map<any, any>, cur: TransferWithTokenInfoResponse) => {
    if (cur.type === GnosisTransferType.ETHER && cur.value) {
      if (prev.has(constants.AddressZero)) {
        const prevValue = prev.get(constants.AddressZero);
        prev.set(constants.AddressZero, {
          bn: prevValue.bn.add(BigNumber.from(cur.value)),
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
      prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
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
  }, []);

  const eventTransactionMapping = (
    multiSigTransaction: SafeMultisigTransactionWithTransfersResponse,
    isMultiSigTransaction: boolean
  ) => {
    const eventTransactionMap = new Map<number, any>();
    const parseTransactions = (parameters: any[]) => {
      if (!parameters || !parameters.length) {
        return;
      }
      parameters.forEach((param: any) => {
        const dataDecoded = param.dataDecoded || param.valueDecoded;

        if (param.to) {
          eventTransactionMap.set(eventTransactionMap.size, {
            address: param.to,
          });
        }
        return parseTransactions(dataDecoded);
      });
    };

    const dataDecoded = multiSigTransaction.dataDecoded as any;
    if (dataDecoded && isMultiSigTransaction) {
      parseTransactions(dataDecoded.parameters);
    }
    return eventTransactionMap;
  };
  return { totalsReducer, eventTransactionMapping };
};
