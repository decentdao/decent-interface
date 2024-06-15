import { useCallback, useEffect, useRef } from 'react';
import { getContract, Address } from 'viem';
import { usePublicClient } from 'wagmi';
import LinearERC20VotingAbi from '../../../assets/abi/LinearERC20Voting';
import LockReleaseAbi from '../../../assets/abi/LockRelease';
import VotesERC20WrapperAbi from '../../../assets/abi/VotesERC20Wrapper';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { getAzoriusModuleFromModules } from '../../../utils';
import { useMasterCopy } from '../../utils/useMasterCopy';
import useVotingStrategyAddress from '../../utils/useVotingStrategyAddress';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const { node, action } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  const { fractalModules, isModulesLoaded, daoAddress } = node;

  const loadGovernanceContracts = useCallback(async () => {
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);

    const votingStrategyAddress = await getVotingStrategyAddress();

    if (!azoriusModule || !votingStrategyAddress) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {},
      });
      return;
    }

    let ozLinearVotingContractAddress: Address | undefined;
    let erc721LinearVotingContractAddress: string | undefined;
    let votesTokenContractAddress: string | undefined;
    let underlyingTokenAddress: string | undefined;
    let lockReleaseContractAddress: string | undefined;

    const { isOzLinearVoting, isOzLinearVotingERC721 } =
      await getZodiacModuleProxyMasterCopyData(votingStrategyAddress);

    if (isOzLinearVoting) {
      if (!publicClient) {
        throw new Error('public client not set');
      }

      ozLinearVotingContractAddress = votingStrategyAddress;

      const ozLinearVotingContract = getContract({
        abi: LinearERC20VotingAbi,
        address: ozLinearVotingContractAddress,
        client: publicClient,
      });
      const govTokenAddress = await ozLinearVotingContract.read.governanceToken();

      const possibleERC20Wrapper = getContract({
        abi: VotesERC20WrapperAbi,
        address: govTokenAddress,
        client: publicClient,
      });

      underlyingTokenAddress = await possibleERC20Wrapper.read.underlying().catch(() => {
        // if the underlying token is not an ERC20Wrapper, this will throw an error,
        // so we catch it and return undefined
        return undefined;
      });
      const possibleLockRelease = getContract({
        address: govTokenAddress,
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
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {
          ozLinearVotingContractAddress,
          erc721LinearVotingContractAddress,
          azoriusContractAddress: azoriusModule.moduleAddress,
          votesTokenContractAddress,
          underlyingTokenAddress,
          lockReleaseContractAddress,
        },
      });
    }
  }, [
    action,
    fractalModules,
    getVotingStrategyAddress,
    getZodiacModuleProxyMasterCopyData,
    publicClient,
  ]);

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
