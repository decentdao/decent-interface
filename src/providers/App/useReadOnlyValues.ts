import { ERC721__factory } from '@fractal-framework/fractal-contracts';
import { BigNumber, utils } from 'ethers';
import { useEffect, useState } from 'react';
import useSignerOrProvider from '../../hooks/utils/useSignerOrProvider';
import { Fractal, AzoriusGovernance, GovernanceSelectionType, ReadOnlyState } from '../../types';

const INITIAL_READ_ONLY_VALUES: ReadOnlyState = {
  user: {
    address: undefined,
    votingWeight: BigNumber.from(0),
  },
  dao: null,
};
/**
 * Sets "read only" values which are passed on to the FractalProvider.
 *
 * These are useful dao or user specific values calculated from other stateful
 * values.
 */
export const useReadOnlyValues = ({ node, governance }: Fractal, _account?: string) => {
  const [readOnlyValues, setReadOnlyValues] = useState<ReadOnlyState>(INITIAL_READ_ONLY_VALUES);
  const signerOrProvider = useSignerOrProvider();

  useEffect(() => {
    const loadReadOnlyValues = async () => {
      const getVotingWeight = async () => {
        const azoriusGovernance = governance as AzoriusGovernance;
        switch (governance.type) {
          case GovernanceSelectionType.MULTISIG:
            const isSigner = _account && node.safe?.owners.includes(_account);
            return isSigner ? BigNumber.from(1) : BigNumber.from(0);
          case GovernanceSelectionType.AZORIUS_ERC20:
            const tokenWeight = azoriusGovernance.votesToken?.votingWeight || BigNumber.from(0);
            return tokenWeight;
          case GovernanceSelectionType.AZORIUS_ERC721:
            if (!_account || !azoriusGovernance.erc721Tokens) {
              return BigNumber.from(0);
            }
            const userVotingWeight = (
              await Promise.all(
                azoriusGovernance.erc721Tokens.map(async ({ address, votingWeight }) => {
                  const tokenContract = ERC721__factory.connect(address, signerOrProvider);
                  const userBalance = await tokenContract.balanceOf(_account);
                  return userBalance.mul(votingWeight);
                })
              )
            ).reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
            return userVotingWeight;
          default:
            return BigNumber.from(0);
        }
      };

      setReadOnlyValues({
        user: {
          address: _account ? utils.getAddress(_account) : undefined,
          votingWeight: await getVotingWeight(),
        },
        dao: !node.daoAddress
          ? null // if there is no DAO connected, we return null for this
          : {
              isAzorius:
                governance.type === GovernanceSelectionType.AZORIUS_ERC20 ||
                governance.type === GovernanceSelectionType.AZORIUS_ERC721,
            },
      });
    };

    loadReadOnlyValues();
  }, [node, governance, _account, signerOrProvider]);
  return { readOnlyValues };
};
