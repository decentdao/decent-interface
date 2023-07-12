import { BigNumber, utils } from 'ethers';
import { useCallback } from 'react';
import { Fractal, AzoriusGovernance, GovernanceSelectionType, ReadOnlyState } from '../../types';

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
        case GovernanceSelectionType.MULTISIG:
          return isSigner ? BigNumber.from(1) : BigNumber.from(0);
        case GovernanceSelectionType.AZORIUS_ERC20:
          return tokenWeight;
        case GovernanceSelectionType.AZORIUS_ERC721:
          return BigNumber.from(0);
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
            isAzorius:
              governance.type === GovernanceSelectionType.AZORIUS_ERC20 ||
              governance.type === GovernanceSelectionType.AZORIUS_ERC721,
          },
    } as ReadOnlyState;
  }, []);
  return { readOnlyValues };
};
