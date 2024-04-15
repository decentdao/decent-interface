import { useEffect, useState, useCallback } from 'react';
import { getAddress, erc721Abi, getContract, Address } from 'viem';
import useContractClient from '../../hooks/utils/useContractClient';
import {
  ReadOnlyState,
  Fractal,
  AzoriusGovernance,
  GovernanceType,
  DecentGovernance,
} from '../../types';

const INITIAL_READ_ONLY_VALUES: ReadOnlyState = {
  user: {
    address: undefined,
    votingWeight: 0n,
  },
  dao: null,
};
/**
 * Sets "read only" values which are passed on to the FractalProvider.
 *
 * These are useful dao or user specific values calculated from other stateful
 * values.
 */
export const useReadOnlyValues = ({ node, governance }: Fractal, _account?: Address) => {
  const [readOnlyValues, setReadOnlyValues] = useState<ReadOnlyState>(INITIAL_READ_ONLY_VALUES);
  const { walletOrPublicClient } = useContractClient();

  const loadReadOnlyValues = useCallback(async () => {
    const getVotingWeight = async () => {
      const azoriusGovernance = governance as AzoriusGovernance;
      switch (governance.type) {
        case GovernanceType.MULTISIG:
          const isSigner = _account && node.safe?.owners.includes(_account);
          return isSigner ? 1n : 0n;
        case GovernanceType.AZORIUS_ERC20:
          const lockedTokenWeight = (governance as DecentGovernance).lockedVotesToken?.votingWeight;
          const tokenWeight = azoriusGovernance.votesToken?.votingWeight || 0n;
          return lockedTokenWeight || tokenWeight;
        case GovernanceType.AZORIUS_ERC721:
          if (!_account || !azoriusGovernance.erc721Tokens || !walletOrPublicClient) {
            return 0n;
          }
          const userVotingWeight = (
            await Promise.all(
              azoriusGovernance.erc721Tokens.map(async ({ address, votingWeight }) => {
                const tokenContract = getContract({
                  address,
                  abi: erc721Abi,
                  client: walletOrPublicClient,
                });
                const userBalance = await tokenContract.read.balanceOf([_account]);
                return userBalance * votingWeight;
              }),
            )
          ).reduce((prev, curr) => prev + curr, 0n);
          return userVotingWeight;
        default:
          return 0n;
      }
    };

    setReadOnlyValues({
      user: {
        address: _account ? getAddress(_account) : undefined,
        votingWeight: await getVotingWeight(),
      },
      dao: !node.daoAddress
        ? null // if there is no DAO connected, we return null for this
        : {
            isAzorius:
              governance.type === GovernanceType.AZORIUS_ERC20 ||
              governance.type === GovernanceType.AZORIUS_ERC721,
          },
    });
  }, [node, governance, _account, walletOrPublicClient]);
  useEffect(() => {
    loadReadOnlyValues();
  }, [loadReadOnlyValues]);
  return { readOnlyValues, loadReadOnlyValues };
};
