import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import LockReleaseAbi from '../../../assets/abi/LockRelease';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { getAzoriusModuleFromModules } from '../../../utils';
import { useAddressContractType } from '../../utils/useAddressContractType';
import useVotingStrategyAddress from '../../utils/useVotingStrategiesAddresses';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const { action } = useFractal();
  const node = useDaoInfoStore();
  const publicClient = usePublicClient();
  const { getAddressContractType } = useAddressContractType();

  const { getVotingStrategies } = useVotingStrategyAddress();
  const { daoModules, safe } = node;

  const safeAddress = safe?.address;

  const loadGovernanceContracts = useCallback(async () => {
    const azoriusModule = getAzoriusModuleFromModules(daoModules ?? []);

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
      // govTokenAddress might be either
      // - a valid VotesERC20 contract
      // - a valid VotesERC20Wrapper contract
      // - a valid LockRelease contract
      // - or none of these which is against business logic

      const { isVotesErc20, isVotesErc20Wrapper } = await getAddressContractType(govTokenAddress);

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
    };

    await Promise.all(
      votingStrategies.map(async votingStrategy => {
        const {
          strategyAddress,
          isLinearVotingErc20,
          isLinearVotingErc721,
          isLinearVotingErc20WithHatsProposalCreation,
          isLinearVotingErc721WithHatsProposalCreation,
        } = votingStrategy;
        if (isLinearVotingErc20) {
          linearVotingErc20Address = strategyAddress;
          await setGovTokenAddress(strategyAddress);
        } else if (isLinearVotingErc721) {
          linearVotingErc721Address = strategyAddress;
        } else if (isLinearVotingErc20WithHatsProposalCreation) {
          linearVotingErc20WithHatsWhitelistingAddress = strategyAddress;
          await setGovTokenAddress(strategyAddress);
        } else if (isLinearVotingErc721WithHatsProposalCreation) {
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
  }, [action, daoModules, getVotingStrategies, publicClient, getAddressContractType]);

  useEffect(() => {
    if (currentValidAddress.current !== safeAddress && daoModules !== null) {
      loadGovernanceContracts();
      currentValidAddress.current = safeAddress;
    }
    if (!safeAddress) {
      currentValidAddress.current = null;
    }
  }, [daoModules, loadGovernanceContracts, safeAddress]);
};
