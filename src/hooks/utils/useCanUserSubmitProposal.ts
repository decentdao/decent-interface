import { useState, useCallback, useEffect } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../assets/abi/Azorius';
import LinearERC20VotingAbi from '../../assets/abi/LinearERC20Voting';
import LinearERC721VotingAbi from '../../assets/abi/LinearERC721Voting';
import { SENTINEL_ADDRESS } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { GovernanceType } from '../../types';
import { getAzoriusModuleFromModules } from '../../utils';
import { useFractalModules } from '../DAO/loaders/useFractalModules';

export function useCanUserCreateProposal() {
  const {
    node: { safe },
    governance: { type },
    governanceContracts: { ozLinearVotingContractAddress, erc721LinearVotingContractAddress },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();
  // const baseContracts = useSafeContracts();
  const lookupModules = useFractalModules();
  const [canUserCreateProposal, setCanUserCreateProposal] = useState<boolean>();
  const publicClient = usePublicClient();

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
        const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
        const safeModules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(safeModules);

        if (azoriusModule) {
          const azoriusContract = getContract({
            abi: AzoriusAbi,
            address: getAddress(azoriusModule.moduleAddress),
            client: publicClient,
          });
          // @dev assumes the first strategy is the voting contract
          const votingContractAddress = (
            await azoriusContract.read.getStrategies([SENTINEL_ADDRESS, 0n])
          )[1];
          const votingContract = getContract({
            abi: LinearERC20VotingAbi,
            address: getAddress(votingContractAddress),
            client: publicClient,
          });
          const isProposer = await votingContract.read.isProposer([getAddress(user.address)]);
          return isProposer;
        } else {
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
      lookupModules,
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
