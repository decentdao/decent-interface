import { useCallback, useEffect, useRef } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import LockReleaseABI from '../../../assets/abi/LockRelease';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { Azorius } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';
import useSafeContracts from '../../safe/useSafeContracts';
import { useMasterCopy } from '../../utils/useMasterCopy';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const { node, action } = useFractal();
  const baseContracts = useSafeContracts();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const publicClient = usePublicClient();

  const { fractalModules, isModulesLoaded, daoAddress } = node;

  const loadGovernanceContracts = useCallback(async () => {
    if (!baseContracts) {
      return;
    }
    const {
      fractalAzoriusMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
      linearVotingMasterCopyContract,
    } = baseContracts;
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);
    const azoriusModuleContract = azoriusModule?.moduleContract as Azorius;

    if (!!azoriusModuleContract && !!publicClient) {
      const azoriusContract = getContract({
        address: azoriusModuleContract.address,
        client: publicClient,
        abi: fractalAzoriusMasterCopyContract.asPublic.abi,
      });

      let govTokenAddress: Address | undefined;

      let ozLinearVotingContractAddress: Address | undefined;
      let erc721LinearVotingContractAddress: Address | undefined;
      let votesTokenContractAddress: Address | undefined;
      let underlyingTokenAddress: Address | undefined;
      let lockReleaseContractAddress: Address | undefined;

      // @dev assumes the first strategy is the voting contract
      const votingStrategyAddresses = (await azoriusContract.read.getStrategies([
        '0x0000000000000000000000000000000000000001',
        0,
      ])) as Address[];
      const votingStrategyAddress = votingStrategyAddresses[1];

      const masterCopyData = await getZodiacModuleProxyMasterCopyData(votingStrategyAddress);
      const isOzLinearVoting = masterCopyData.isOzLinearVoting;
      const isOzLinearVotingERC721 = masterCopyData.isOzLinearVotingERC721;

      if (isOzLinearVoting) {
        ozLinearVotingContractAddress = votingStrategyAddress;
        const ozLinearVotingContract = getContract({
          address: ozLinearVotingContractAddress,
          client: publicClient,
          abi: linearVotingMasterCopyContract.asPublic.abi,
        });
        govTokenAddress = (await ozLinearVotingContract.read.governanceToken([])) as Address;
        if (govTokenAddress) {
          const possibleERC20Wrapper = getContract({
            address: govTokenAddress,
            abi: votesERC20WrapperMasterCopyContract.asPublic.abi,
            client: publicClient,
          });
          underlyingTokenAddress = (await possibleERC20Wrapper.read.underlying([]).catch(() => {
            // if the underlying token is not an ERC20Wrapper, this will throw an error,
            // so we catch it and return undefined
            return undefined;
          })) as Address | undefined;
          const possibleLockRelease = getContract({
            address: govTokenAddress,
            abi: LockReleaseABI,
            client: publicClient,
          });

          const lockedTokenAddress = await possibleLockRelease.read.token().catch(() => {
            // if the underlying token is not an ERC20Wrapper, this will throw an error,
            // so we catch it and return undefined
            return undefined;
          });

          if (lockedTokenAddress) {
            lockReleaseContractAddress = govTokenAddress;
            votesTokenContractAddress = lockedTokenAddress as Address;
          } else {
            // @dev if the underlying token is an ERC20Wrapper, we use the underlying token as the token contract
            // @dev if the no underlying token, we use the governance token as the token contract
            votesTokenContractAddress = govTokenAddress;
          }
        }
      } else if (isOzLinearVotingERC721) {
        // @dev for use with the ERC721 voting contract
        erc721LinearVotingContractAddress = votingStrategyAddress as Address;
      }

      if (!!votesTokenContractAddress) {
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContractAddress: ozLinearVotingContractAddress,
            erc721LinearVotingContractAddress: erc721LinearVotingContractAddress,
            azoriusContractAddress: azoriusModuleContract.address,
            votesTokenContractAddress,
            underlyingTokenAddress,
            lockReleaseContractAddress,
          },
        });
      }
      // else this has no governance token and can be assumed is a multi-sig
    } else {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
        payload: {},
      });
    }
  }, [action, getZodiacModuleProxyMasterCopyData, baseContracts, fractalModules, publicClient]);

  useEffect(() => {
    if (currentValidAddress.current !== daoAddress && isModulesLoaded) {
      loadGovernanceContracts();
      currentValidAddress.current = daoAddress;
    }
    if (!daoAddress) {
      currentValidAddress.current = null;
    }
  }, [isModulesLoaded, loadGovernanceContracts, daoAddress]);
};
