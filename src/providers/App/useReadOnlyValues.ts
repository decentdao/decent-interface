import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { Fractal, AzoriusGovernance, StrategyType, DAO, ReadOnlyState } from '../../types';

export const useReadOnlyValues = () => {
  const readOnlyValues = useCallback((_state: Fractal, _account: string | undefined) => {
    const { node, governance } = _state;

    const isSigner = _account && node.safe?.owners.includes(_account);
    const tokenWeight =
      (governance as AzoriusGovernance).votesToken?.votingWeight || BigNumber.from(0);

    const votingWeight = () => {
      switch (governance.type) {
        case StrategyType.GNOSIS_SAFE:
          return isSigner ? BigNumber.from(1) : BigNumber.from(0);
        case StrategyType.GNOSIS_SAFE_USUL:
          return tokenWeight;
        default:
          return BigNumber.from(0);
      }
    };

    // if there is no DAO connected, return null for this
    const dao: DAO | null = !node.daoAddress
      ? null
      : {
          isAzorius: governance.type === StrategyType.GNOSIS_SAFE_USUL,
        };

    return {
      user: {
        address: _account, // TODO normalize?
        votingWeight: votingWeight(),
      },
      dao: dao,
    } as ReadOnlyState;
  }, []);
  return { readOnlyValues };
};
