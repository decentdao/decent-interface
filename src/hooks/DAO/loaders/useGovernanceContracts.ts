import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import LockReleaseAbi from '../../../assets/abi/LockRelease';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { getAzoriusModuleFromModules } from '../../../utils';
import useVotingStrategyAddress from '../../utils/useVotingStrategiesAddresses';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const { node, action } = useFractal();
  const publicClient = usePublicClient();

  const { getVotingStrategies } = useVotingStrategyAddress();

  const { fractalModules, isModulesLoaded, daoAddress } = node;

  const loadGovernanceContracts = useCallback(async () => {
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);

    const votingStrategies = await getVotingStrategies();

    if (!azoriusModule || !votingStrategies) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {},
      });
      return;
    }

    if (!publicClient) {
      throw new Error('Public Client is not set!');
    }

    let linearVotingErc20Address: Address | undefined;
    let linearVotingErc721Address: Address | undefined;
    let linearVotingErc20WithHatsWhitelistingAddress: Address | undefined;
    let linearVotingErc721WithHatsWhitelistingAddress: Address | undefined;
    let votesTokenAddress: Address | undefined;
    let underlyingTokenAddress: Address | undefined;
    let lockReleaseAddress: Address | undefined;

    const setGovTokenAddress = async (erc20VotingStrategyAddress: Address) => {
      if (votesTokenAddress) {
        return;
      }
      const ozLinearVotingContract = getContract({
        abi: abis.LinearERC20Voting,
        address: erc20VotingStrategyAddress,
        client: publicClient,
      });
      const govTokenAddress = await ozLinearVotingContract.read.governanceToken();

      const possibleERC20Wrapper = getContract({
        abi: abis.VotesERC20Wrapper,
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
        lockReleaseAddress = govTokenAddress;
        // @dev if the underlying token is an ERC20Wrapper, we use the underlying token as the token contract
        votesTokenAddress = lockedTokenAddress;
      } else {
        // @dev if the no underlying token, we use the governance token as the token contract
        votesTokenAddress = govTokenAddress;
      }
    };

    await Promise.all(
      votingStrategies.map(async votingStrategy => {
        const {
          strategyAddress,
          isLinearVotingErc20,
          isLinearVotingErc721,
          isLinearVotingErc20WithWhitelisting,
          isLinearVotingErc721WithWhitelisting,
        } = votingStrategy;
        if (isLinearVotingErc20) {
          linearVotingErc20Address = strategyAddress;
          setGovTokenAddress(strategyAddress);
        } else if (isLinearVotingErc721) {
          linearVotingErc721Address = strategyAddress;
        } else if (isLinearVotingErc20WithWhitelisting) {
          linearVotingErc20WithHatsWhitelistingAddress = strategyAddress;
          setGovTokenAddress(strategyAddress);
        } else if (isLinearVotingErc721WithWhitelisting) {
          linearVotingErc721WithHatsWhitelistingAddress = strategyAddress;
        }
      }),
    );

    if (
      linearVotingErc20Address ||
      linearVotingErc20WithHatsWhitelistingAddress ||
      linearVotingErc721Address ||
      linearVotingErc721WithHatsWhitelistingAddress
    ) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {
          linearVotingErc20Address,
          linearVotingErc20WithHatsWhitelistingAddress,
          linearVotingErc721Address,
          linearVotingErc721WithHatsWhitelistingAddress,
          votesTokenAddress,
          underlyingTokenAddress,
          lockReleaseAddress,
          moduleAzoriusAddress: azoriusModule.moduleAddress,
        },
      });
    }
  }, [action, fractalModules, getVotingStrategies, publicClient]);

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
