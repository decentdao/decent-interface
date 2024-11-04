import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { getContract, Address } from 'viem';
import { usePublicClient } from 'wagmi';
import LockReleaseAbi from '../../../assets/abi/LockRelease';
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

    let linearVotingErc20Address: Address | undefined;
    let linearVotingErc721Address: Address | undefined;
    let votesTokenAddress: Address | undefined;
    let underlyingTokenAddress: Address | undefined;
    let lockReleaseAddress: Address | undefined;

    const { isLinearVotingErc20, isLinearVotingErc721 } =
      await getZodiacModuleProxyMasterCopyData(votingStrategyAddress);

    if (isLinearVotingErc20) {
      if (!publicClient) {
        throw new Error('public client not set');
      }

      linearVotingErc20Address = votingStrategyAddress;

      const ozLinearVotingContract = getContract({
        abi: abis.LinearERC20Voting,
        address: linearVotingErc20Address,
        client: publicClient,
      });

      const govTokenAddress = await ozLinearVotingContract.read.governanceToken();
      // govTokenAddress might be either
      // - a valid VotesERC20 contract
      // - a valid VotesERC20Wrapper contract
      // - a valid LockRelease contract
      // - or none of these which is against business logic

      const { isVotesErc20, isVotesErc20Wrapper } =
        await getZodiacModuleProxyMasterCopyData(govTokenAddress);

      if (isVotesErc20) {
        votesTokenAddress = govTokenAddress;
      } else if (isVotesErc20Wrapper) {
        const wrapperContract = getContract({
          abi: abis.VotesERC20Wrapper,
          address: govTokenAddress,
          client: publicClient,
        });
        underlyingTokenAddress = await wrapperContract.read.underlying();
        votesTokenAddress = govTokenAddress;
      } else {
        const possibleLockRelease = getContract({
          address: govTokenAddress,
          abi: LockReleaseAbi,
          client: { public: publicClient },
        });

        try {
          const lockedTokenAddress = await possibleLockRelease.read.token();
          lockReleaseAddress = govTokenAddress;
          votesTokenAddress = lockedTokenAddress;
        } catch {
          throw new Error('Unknown governance token type');
        }
      }
    } else if (isLinearVotingErc721) {
      // @dev for use with the ERC721 voting contract
      linearVotingErc721Address = votingStrategyAddress;
    }

    if (votesTokenAddress || linearVotingErc721Address) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {
          linearVotingErc20Address,
          linearVotingErc721Address,
          votesTokenAddress,
          underlyingTokenAddress,
          lockReleaseAddress,
          moduleAzoriusAddress: azoriusModule.moduleAddress,
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
