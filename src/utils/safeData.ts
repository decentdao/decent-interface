import { TransferWithTokenInfoResponse } from '@safe-global/safe-service-client';
import { zeroAddress } from 'viem';
import { AssetTotals, SafeTransferType } from '../types';

/**
 * Used for looping for Transfer data retrieved from Safe api to determind a total for each asset in a safe
 *
 * @param prev Map<string, AssetTotals>
 * @param cur TransferWithTokenInfoResponse
 */
export const totalsReducer = (
  prev: Map<string, AssetTotals>,
  cur: TransferWithTokenInfoResponse,
) => {
  if (cur.type === SafeTransferType.ETHER && cur.value) {
    const prevValue = prev.get(zeroAddress)!;
    if (prevValue) {
      prev.set(zeroAddress, {
        bi: prevValue.bi + BigInt(cur.value),
        symbol: 'ETHER',
        decimals: 18,
      });
    }
    prev.set(zeroAddress, {
      bi: BigInt(cur.value),
      symbol: 'ETHER',
      decimals: 18,
    });
  }
  if (cur.type === SafeTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
    prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
      bi: 1n,
      symbol: cur.tokenInfo.symbol,
      decimals: 0,
    });
  }
  if (cur.type === SafeTransferType.ERC20 && cur.value && cur.tokenInfo) {
    const prevValue = prev.get(cur.tokenInfo.address);
    if (prevValue) {
      prev.set(cur.tokenInfo.address, {
        ...prevValue,
        bi: prevValue.bi + BigInt(cur.value),
      });
    } else {
      prev.set(cur.tokenAddress!, {
        bi: BigInt(cur.value),
        symbol: cur.tokenInfo.symbol,
        decimals: cur.tokenInfo.decimals,
      });
    }
  }

  return prev;
};
