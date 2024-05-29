import { useState, useCallback, useEffect } from 'react';
import { getAddress, getContract } from 'viem';
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
    governanceContracts: { ozLinearVotingContractAddress, erc721LinearVotingContractAddress },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const [canUserCreateProposal, setCanUserCreateProposal] = useState<boolean>();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  /**
   * Performs a check whether user has access rights to create proposal for DAO
   * @param {string} safeAddress - parameter to verify that user can create proposal for this specific DAO.
   * Otherwise - it is checked for DAO from the global context.
   * @returns {Promise<boolean>} - whether or not user has rights to create proposal either in global scope either for provided `safeAddress`.
   */
  const getCanUserCreateProposal = useCallback(
    async (safeAddress?: string): Promise<boolean | undefined> => {
      if (!user.address || !safeAPI || !publicClient) {
        return;
      }

      const checkIsMultisigOwner = (owners?: string[]) => {
        return !!owners?.includes(user.address || '');
      };

      if (safeAddress) {
        const votingStrategyAddress = await getVotingStrategyAddress(getAddress(safeAddress));
        if (votingStrategyAddress) {
          const votingContract = getContract({
            abi: LinearERC20VotingAbi,
            address: votingStrategyAddress,
            client: publicClient,
          });
          const isProposer = await votingContract.read.isProposer([getAddress(user.address)]);
          return isProposer;
        } else {
          const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
          return checkIsMultisigOwner(safeInfo.owners);
        }
      } else {
        if (type === GovernanceType.MULTISIG) {
          const { owners } = safe || {};
          return checkIsMultisigOwner(owners);
        } else if (type === GovernanceType.AZORIUS_ERC20) {
          if (ozLinearVotingContractAddress) {
            const ozLinearVotingContract = getContract({
              abi: LinearERC20VotingAbi,
              address: getAddress(ozLinearVotingContractAddress),
              client: publicClient,
            });
            return ozLinearVotingContract.read.isProposer([getAddress(user.address)]);
          }
        } else if (type === GovernanceType.AZORIUS_ERC721 && erc721LinearVotingContractAddress) {
          const erc721LinearVotingContract = getContract({
            abi: LinearERC721VotingAbi,
            address: getAddress(erc721LinearVotingContractAddress),
            client: publicClient,
          });
          return erc721LinearVotingContract.read.isProposer([getAddress(user.address)]);
        } else {
          return;
        }
      }
      return;
    },
    [
      erc721LinearVotingContractAddress,
      getVotingStrategyAddress,
      ozLinearVotingContractAddress,
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
