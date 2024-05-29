import { useCallback, useEffect, useRef } from 'react';
import { getContract, getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../../assets/abi/Azorius';
import LinearERC20VotingAbi from '../../../assets/abi/LinearERC20Voting';
import LockReleaseAbi from '../../../assets/abi/LockRelease';
import VotesERC20WrapperAbi from '../../../assets/abi/VotesERC20Wrapper';
import { SENTINEL_ADDRESS } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
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
    if (!baseContracts || !publicClient) {
      return;
    }
    const { fractalAzoriusMasterCopyContract } = baseContracts;
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);

    if (!azoriusModule) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
        payload: {},
      });
      return;
    }

    const azoriusModuleContract = getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusModule.moduleAddress),
      client: publicClient,
    });

    const azoriusContract = fractalAzoriusMasterCopyContract.asProvider.attach(
      azoriusModuleContract.address,
    );
    let ozLinearVotingContractAddress: string | undefined;
    let erc721LinearVotingContractAddress: string | undefined;
    let votesTokenContractAddress: string | undefined;
    let underlyingTokenAddress: string | undefined;
    let lockReleaseContractAddress: string | undefined;

    // @dev assumes the first strategy is the voting contract
    const votingStrategyAddress = (await azoriusContract.getStrategies(SENTINEL_ADDRESS, 0))[1];

    const masterCopyData = await getZodiacModuleProxyMasterCopyData(
      getAddress(votingStrategyAddress),
    );
    const isOzLinearVoting = masterCopyData.isOzLinearVoting;
    const isOzLinearVotingERC721 = masterCopyData.isOzLinearVotingERC721;

    if (isOzLinearVoting) {
      ozLinearVotingContractAddress = votingStrategyAddress;

      const ozLinearVotingContract = getContract({
        abi: LinearERC20VotingAbi,
        address: getAddress(ozLinearVotingContractAddress),
        client: publicClient,
      });
      const govTokenAddress = await ozLinearVotingContract.read.governanceToken();

      const possibleERC20Wrapper = getContract({
        abi: VotesERC20WrapperAbi,
        address: getAddress(govTokenAddress),
        client: publicClient,
      });

      underlyingTokenAddress = await possibleERC20Wrapper.read.underlying().catch(() => {
        // if the underlying token is not an ERC20Wrapper, this will throw an error,
        // so we catch it and return undefined
        return undefined;
      });
      const possibleLockRelease = getContract({
        address: getAddress(govTokenAddress),
        abi: LockReleaseAbi,
        client: { public: publicClient },
      });

      let lockedTokenAddress = undefined;
      try {
        lockedTokenAddress = await possibleLockRelease.read.token();
      } catch {
        // no-op
        // if the underlying token is not an ERC20Wrapper, this will throw an error,
        // so we catch it and do nothing
      }

      if (lockedTokenAddress) {
        lockReleaseContractAddress = govTokenAddress;
        // @dev if the underlying token is an ERC20Wrapper, we use the underlying token as the token contract
        votesTokenContractAddress = lockedTokenAddress;
      } else {
        // @dev if the no underlying token, we use the governance token as the token contract
        votesTokenContractAddress = govTokenAddress;
      }
    } else if (isOzLinearVotingERC721) {
      // @dev for use with the ERC721 voting contract
      erc721LinearVotingContractAddress = votingStrategyAddress;
    }

    if (votesTokenContractAddress || erc721LinearVotingContractAddress) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
        payload: {
          ozLinearVotingContractAddress,
          erc721LinearVotingContractAddress,
          azoriusContractAddress: azoriusModuleContract.address,
          votesTokenContractAddress,
          underlyingTokenAddress,
          lockReleaseContractAddress,
        },
      });
    }
    // else this has no governance token and can be assumed is a multi-sig
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
