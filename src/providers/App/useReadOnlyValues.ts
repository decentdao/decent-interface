import { BigNumber, utils } from 'ethers';
import { useCallback } from 'react';
import { Fractal, AzoriusGovernance, StrategyType, ReadOnlyState } from '../../types';

/**
 * Sets "read only" values which are passed on to the FractalProvider.
 *
 * These are useful dao or user specific values calculated from other stateful
 * values.
 */
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
        case StrategyType.GNOSIS_SAFE_AZORIUS:
          return tokenWeight;
        default:
          return BigNumber.from(0);
      }
    };

    return {
      user: {
        address: _account ? utils.getAddress(_account) : undefined,
        votingWeight: votingWeight(),
      },
      dao: !node.daoAddress
        ? null // if there is no DAO connected, we return null for this
        : {
            isAzorius: governance.type === StrategyType.GNOSIS_SAFE_AZORIUS,
          },
    } as ReadOnlyState;
  }, []);
  return { readOnlyValues };
};
