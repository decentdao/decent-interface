import { Azorius } from '@fractal-framework/fractal-contracts';
import { useState, useCallback, useEffect } from 'react';
import { Address, getAddress } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { GovernanceType } from '../../types';
import { getAzoriusModuleFromModules } from '../../utils';
import { useFractalModules } from '../DAO/loaders/useFractalModules';
import useSafeContracts from '../safe/useSafeContracts';

export function useCanUserCreateProposal() {
  const {
    node: { safe },
    governance: { type },
    governanceContracts: { ozLinearVotingContractAddress, erc721LinearVotingContractAddress },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const baseContracts = useSafeContracts();
  const lookupModules = useFractalModules();
  const [canUserCreateProposal, setCanUserCreateProposal] = useState<boolean>();
  /**
   * Performs a check whether user has access rights to create proposal for DAO
   * @param {string} safeAddress - parameter to verify that user can create proposal for this specific DAO.
   * Otherwise - it is checked for DAO from the global context.
   * @returns {Promise<boolean>} - whether or not user has rights to create proposal either in global scope either for provided `safeAddress`.
   */
  const getCanUserCreateProposal = useCallback(
    async (safeAddress?: string): Promise<boolean | undefined> => {
      if (!user.address || !safeAPI) {
        return;
      }

      const checkIsMultisigOwner = (owners?: string[]) => {
        return !!owners?.includes(user.address || '');
      };

      if (safeAddress && baseContracts) {
        const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
        const safeModules = await lookupModules(safeInfo.modules as Address[]);
        const azoriusModule = getAzoriusModuleFromModules(safeModules);

        if (azoriusModule && azoriusModule.moduleContract) {
          const azoriusContract = azoriusModule.moduleContract as Azorius;
          // @dev assumes the first strategy is the voting contract
          const votingContractAddress = (
            await azoriusContract.getStrategies('0x0000000000000000000000000000000000000001', 0)
          )[1];
          const votingContract =
            baseContracts.linearVotingMasterCopyContract.asProvider.attach(votingContractAddress);
          const isProposer = await votingContract.isProposer(user.address);
          return isProposer;
        } else {
          return checkIsMultisigOwner(safeInfo.owners);
        }
      } else {
        if (type === GovernanceType.MULTISIG) {
          const { owners } = safe || {};
          return checkIsMultisigOwner(owners);
        } else if (type === GovernanceType.AZORIUS_ERC20) {
          if (ozLinearVotingContractAddress && user.address && baseContracts) {
            const ozLinearVotingContract =
              baseContracts.linearVotingMasterCopyContract.asProvider.attach(
                ozLinearVotingContractAddress,
              );
            return ozLinearVotingContract.isProposer(user.address);
          }
        } else if (
          type === GovernanceType.AZORIUS_ERC721 &&
          baseContracts &&
          erc721LinearVotingContractAddress
        ) {
          const erc721LinearVotingContract =
            baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
              erc721LinearVotingContractAddress,
            );
          return erc721LinearVotingContract.isProposer(user.address);
        } else {
          return;
        }
      }
      return;
    },
    [
      safe,
      type,
      user,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
      lookupModules,
      safeAPI,
      baseContracts,
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
