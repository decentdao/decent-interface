import * as amplitude from '@amplitude/analytics-browser';
import * as Sentry from '@sentry/react';
import isEqual from 'lodash.isequal';
import { useCallback, useEffect, useState } from 'react';
import { erc721Abi, getContract } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import {
  AzoriusGovernance,
  DecentGovernance,
  DaoInfo,
  Governance,
  GovernanceType,
  ReadOnlyState,
} from '../../types';

const INITIAL_READ_ONLY_VALUES: ReadOnlyState = {
  user: {
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
export const useReadOnlyValues = ({
  node,
  governance,
}: {
  node: DaoInfo;
  governance: Governance;
}) => {
  const [readOnlyValues, setReadOnlyValues] = useState<ReadOnlyState>(INITIAL_READ_ONLY_VALUES);
  const publicClient = usePublicClient();
  const user = useAccount();
  const account = user.address;

  const loadReadOnlyValues = useCallback(async () => {
    const getVotingWeight = async () => {
      const azoriusGovernance = governance as AzoriusGovernance;
      switch (governance.type) {
        case GovernanceType.MULTISIG:
          const isSigner = account && node.safe?.owners.includes(account);
          return isSigner ? 1n : 0n;
        case GovernanceType.AZORIUS_ERC20:
          const lockedTokenWeight = (governance as DecentGovernance).lockedVotesToken?.votingWeight;
          const tokenWeight = azoriusGovernance.votesToken?.votingWeight || 0n;
          return lockedTokenWeight || tokenWeight;
        case GovernanceType.AZORIUS_ERC721:
          if (!account || !azoriusGovernance.erc721Tokens || !publicClient) {
            return 0n;
          }
          const userVotingWeight = (
            await Promise.all(
              azoriusGovernance.erc721Tokens.map(async ({ address, votingWeight }) => {
                const tokenContract = getContract({
                  abi: erc721Abi,
                  address: address,
                  client: publicClient,
                });
                const userBalance = await tokenContract.read.balanceOf([account]);
                return userBalance * votingWeight;
              }),
            )
          ).reduce((prev, curr) => prev + curr, 0n);
          return userVotingWeight;
        default:
          return 0n;
      }
    };

    const address = account;
    Sentry.setUser(address ? { id: address } : null);

    if (address) {
      amplitude.setUserId(address);
    } else {
      amplitude.reset();
    }

    const newReadOnlyValues = {
      user: {
        votingWeight: await getVotingWeight(),
      },
      dao: !node.safe?.address
        ? null // if there is no DAO connected, we return null for this
        : {
            isAzorius:
              governance.type === GovernanceType.AZORIUS_ERC20 ||
              governance.type === GovernanceType.AZORIUS_ERC721 ||
              governance.type === GovernanceType.AZORIUS_ERC20_HATS_WHITELISTING ||
              governance.type === GovernanceType.AZORIUS_ERC721_HATS_WHITELISTING,
          },
    };
    if (!isEqual(newReadOnlyValues, readOnlyValues)) {
      setReadOnlyValues(newReadOnlyValues);
    }
  }, [node, governance, account, publicClient, readOnlyValues]);
  useEffect(() => {
    loadReadOnlyValues();
  }, [loadReadOnlyValues]);
  return { readOnlyValues, loadReadOnlyValues };
};
