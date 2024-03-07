import {
  Azorius,
  LinearERC20Voting,
  VotesERC20,
  VotesERC20Wrapper,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { useCallback, useEffect, useRef } from 'react';
import { LockRelease, LockRelease__factory } from '../../../assets/typechain-types/dcnt';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { ContractConnection } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';
import { useMasterCopy } from '../../utils/useMasterCopy';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const { node, baseContracts, action } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const provider = useEthersProvider();
  const signerOrProvider = useSignerOrProvider();

  const { fractalModules, isModulesLoaded, daoAddress } = node;

  const loadGovernanceContracts = useCallback(async () => {
    if (!baseContracts) {
      return;
    }
    const {
      votesTokenMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
      linearVotingMasterCopyContract,
      linearVotingERC721MasterCopyContract,
    } = baseContracts;
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);
    const azoriusModuleContract = azoriusModule?.moduleContract as Azorius;

    if (!!azoriusModuleContract) {
      const azoriusContract = {
        asProvider: fractalAzoriusMasterCopyContract.asProvider.attach(
          azoriusModuleContract.address,
        ),
        asSigner: fractalAzoriusMasterCopyContract.asSigner.attach(azoriusModuleContract.address),
      };

      let votingContractMasterCopyAddress: string | undefined;
      let govTokenAddress: string | undefined;

      let ozLinearVotingContract: ContractConnection<LinearERC20Voting> | undefined;
      let erc721LinearVotingContract: ContractConnection<LinearERC721Voting> | undefined;
      let tokenContract: ContractConnection<VotesERC20 | VotesERC20Wrapper> | undefined;
      let underlyingTokenAddress: string | undefined;
      let lockReleaseContract: ContractConnection<LockRelease> | null = null;

      // @dev assumes the first strategy is the voting contract
      const votingContractAddress = (
        await azoriusContract.asProvider.getStrategies(
          '0x0000000000000000000000000000000000000001',
          0,
        )
      )[1];

      let isOzLinearVoting,
        isOzLinearVotingERC721 = false;
      if (!votingContractMasterCopyAddress) {
        const masterCopyData = await getZodiacModuleProxyMasterCopyData(votingContractAddress);
        isOzLinearVoting = masterCopyData.isOzLinearVoting;
        isOzLinearVotingERC721 = masterCopyData.isOzLinearVotingERC721;
      }

      if (isOzLinearVoting) {
        ozLinearVotingContract = {
          asSigner: linearVotingMasterCopyContract.asSigner.attach(votingContractAddress!),
          asProvider: linearVotingMasterCopyContract.asProvider.attach(votingContractAddress!),
        };
      } else if (isOzLinearVotingERC721) {
        erc721LinearVotingContract = {
          asSigner: linearVotingERC721MasterCopyContract.asSigner.attach(votingContractAddress!),
          asProvider: linearVotingERC721MasterCopyContract.asProvider.attach(
            votingContractAddress!,
          ),
        };
      }

      if (ozLinearVotingContract) {
        govTokenAddress = await ozLinearVotingContract.asProvider.governanceToken();
        const possibleERC20Wrapper =
          votesERC20WrapperMasterCopyContract.asProvider.attach(govTokenAddress);
        underlyingTokenAddress = await possibleERC20Wrapper.underlying().catch(() => {
          // if the underlying token is not an ERC20Wrapper, this will throw an error,
          // so we catch it and return undefined
          return undefined;
        });
        const possibleLockRelease = new ethers.Contract(
          govTokenAddress,
          LockRelease__factory.abi,
          provider,
        ) as LockRelease;

        const lockedToken = await possibleLockRelease.token().catch(() => {
          // if the underlying token is not an ERC20Wrapper, this will throw an error,
          // so we catch it and return undefined
          return undefined;
        });

        if (lockedToken && provider && signerOrProvider) {
          lockReleaseContract = {
            asSigner: LockRelease__factory.connect(govTokenAddress, signerOrProvider),
            asProvider: LockRelease__factory.connect(govTokenAddress, provider),
          };
          tokenContract = {
            asSigner: votesERC20WrapperMasterCopyContract.asSigner.attach(lockedToken),
            asProvider: votesERC20WrapperMasterCopyContract.asProvider.attach(lockedToken),
          };
        } else if (!underlyingTokenAddress) {
          tokenContract = {
            asSigner: votesTokenMasterCopyContract.asSigner.attach(govTokenAddress),
            asProvider: votesTokenMasterCopyContract.asProvider.attach(govTokenAddress),
          };
        } else {
          tokenContract = {
            asSigner: votesERC20WrapperMasterCopyContract.asSigner.attach(govTokenAddress),
            asProvider: votesERC20WrapperMasterCopyContract.asProvider.attach(govTokenAddress),
          };
        }
      }
      if (!!ozLinearVotingContract && !!tokenContract) {
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContract,
            erc721LinearVotingContract: null,
            azoriusContract,
            tokenContract,
            underlyingTokenAddress,
            lockReleaseContract,
          },
        });
      } else if (!!erc721LinearVotingContract) {
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContract: null,
            lockReleaseContract: null,
            erc721LinearVotingContract,
            azoriusContract,
            tokenContract: null,
            underlyingTokenAddress,
          },
        });
      } else if (!!erc721LinearVotingContract) {
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContract: null,
            erc721LinearVotingContract,
            azoriusContract,
            tokenContract: null,
            underlyingTokenAddress,
            lockReleaseContract: null,
          },
        });
      } else {
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContract: null,
            erc721LinearVotingContract: null,
            azoriusContract: null,
            tokenContract: null,
            lockReleaseContract: null,
          },
        });
        currentValidAddress.current = null;
      }
    } else {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
        payload: {
          ozLinearVotingContract: null,
          azoriusContract: null,
          erc721LinearVotingContract: null,
          tokenContract: null,
          lockReleaseContract: null,
        },
      });
      currentValidAddress.current = null;
    }
  }, [
    action,
    provider,
    signerOrProvider,
    getZodiacModuleProxyMasterCopyData,
    baseContracts,
    fractalModules,
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
