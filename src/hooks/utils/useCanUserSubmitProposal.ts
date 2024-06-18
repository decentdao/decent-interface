import { useState, useCallback, useEffect } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import LinearERC20VotingAbi from '../../assets/abi/LinearERC20Voting';
import LinearERC721VotingAbi from '../../assets/abi/LinearERC721Voting';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { GovernanceType } from '../../types';
import useVotingStrategyAddress from './useVotingStrategyAddress';

export function useCanUserCreateProposal() {
  const {
    node: { safe },
    governance: { type },
    governanceContracts: { linearVotingErc20Address, linearVotingErc721Address },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const [canUserCreateProposal, setCanUserCreateProposal] = useState<boolean>();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  const getCanUserCreateProposal = useCallback(
    async (safeAddress?: Address): Promise<boolean | undefined> => {
      if (!user.address || !safeAPI || !publicClient) {
        return;
      }

      const checkIsMultisigOwner = (owners?: string[]) => {
        return !!owners?.includes(user.address || '');
      };

      if (safeAddress) {
        const votingStrategyAddress = await getVotingStrategyAddress(safeAddress);
        if (votingStrategyAddress) {
          const votingContract = getContract({
            abi: LinearERC20VotingAbi,
            address: votingStrategyAddress,
            client: publicClient,
          });
          const isProposer = await votingContract.read.isProposer([user.address]);
          return isProposer;
        } else {
          const safeInfo = await safeAPI.getSafeInfo(safeAddress);
          return checkIsMultisigOwner(safeInfo.owners);
        }
      } else {
        if (type === GovernanceType.MULTISIG) {
          const { owners } = safe || {};
          return checkIsMultisigOwner(owners);
        } else if (type === GovernanceType.AZORIUS_ERC20) {
          if (linearVotingErc20Address) {
            const ozLinearVotingContract = getContract({
              abi: LinearERC20VotingAbi,
              address: linearVotingErc20Address,
              client: publicClient,
            });
            return ozLinearVotingContract.read.isProposer([user.address]);
          }
        } else if (type === GovernanceType.AZORIUS_ERC721 && linearVotingErc721Address) {
          const erc721LinearVotingContract = getContract({
            abi: LinearERC721VotingAbi,
            address: linearVotingErc721Address,
            client: publicClient,
          });
          return erc721LinearVotingContract.read.isProposer([user.address]);
        } else {
          return;
        }
      }
      return;
    },
    [
      linearVotingErc721Address,
      getVotingStrategyAddress,
      linearVotingErc20Address,
      publicClient,
      safe,
      safeAPI,
      type,
      user.address,
    ],
  );
  useEffect(() => {
    const loadCanUserCreateProposal = async () => {
      setCanUserCreateProposal(await getCanUserCreateProposal());
    };
    loadCanUserCreateProposal();
  }, [getCanUserCreateProposal, canUserCreateProposal]);

  return { canUserCreateProposal, getCanUserCreateProposal };
}
