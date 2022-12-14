import { TransferWithTokenInfoResponse } from '@safe-global/safe-service-client';
import { constants, BigNumber } from 'ethers';
import { AssetTotals, GnosisTransferType } from '../types';

/**
 * Used for looping for Transfer data retrieved from Safe api to determind a total for each asset in a safe
 *
 * @param prev Map<string, AssetTotals>
 * @param cur TransferWithTokenInfoResponse
 */
export const totalsReducer = (
  prev: Map<string, AssetTotals>,
  cur: TransferWithTokenInfoResponse
) => {
  if (cur.type === GnosisTransferType.ETHER && cur.value) {
    const prevValue = prev.get(constants.AddressZero)!;
    if (prevValue) {
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
};
