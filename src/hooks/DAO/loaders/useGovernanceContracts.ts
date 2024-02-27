import {
  Azorius,
  LinearERC20Voting,
  VotesERC20,
  VotesERC20Wrapper,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LockRelease, LockRelease__factory } from '../../../assets/typechain-types/dcnt';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { ContractConnection } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';
import { useEthersProvider } from '../../utils/useEthersProvider';
import { useMasterCopy } from '../../utils/useMasterCopy';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const {
    node,
    baseContracts: {
      votesTokenMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
      linearVotingMasterCopyContract,
      linearVotingERC721MasterCopyContract,
    },
    action,
  } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();

  const provider = useEthersProvider();
  const signerOrProvider = useSignerOrProvider();
  const {
    network: { chainId },
  } = provider;

  const [lastChainId, setLastChainId] = useState<number>();

  const loadGovernanceContracts = useCallback(async () => {
    const { fractalModules } = node;

    const azoriusModule = getAzoriusModuleFromModules(fractalModules);
    const azoriusModuleContract = azoriusModule?.moduleContract as Azorius;

    if (node.isModulesLoaded) {
      if (!!azoriusModuleContract) {
        const azoriusContract = {
          asProvider: fractalAzoriusMasterCopyContract.asProvider.attach(
            azoriusModuleContract.address
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
            0
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
              votingContractAddress!
            ),
          };
        }

        if (ozLinearVotingContract) {
          if (!govTokenAddress) {
            govTokenAddress = await ozLinearVotingContract.asProvider.governanceToken();
          }
          const possibleERC20Wrapper =
            votesERC20WrapperMasterCopyContract.asProvider.attach(govTokenAddress);
          underlyingTokenAddress = await possibleERC20Wrapper.underlying().catch(() => {
            // if the underlying token is not an ERC20Wrapper, this will throw an error,
            // so we catch it and return undefined
            return undefined;
          });
          if (underlyingTokenAddress) {
            const possibleLockRelease = new ethers.Contract(
              govTokenAddress,
              LockRelease__factory.abi,
              signerOrProvider
            ) as LockRelease;

            const lockedToken = await possibleLockRelease.token().catch(() => {
              // if the underlying token is not an ERC20Wrapper, this will throw an error,
              // so we catch it and return undefined
              return undefined;
            });

            if (lockedToken) {
              lockReleaseContract = {
                asSigner: LockRelease__factory.connect(govTokenAddress, signerOrProvider),
                asProvider: LockRelease__factory.connect(govTokenAddress, provider),
              };
              tokenContract = {
                asSigner: votesERC20WrapperMasterCopyContract.asSigner.attach(lockedToken),
                asProvider: votesERC20WrapperMasterCopyContract.asProvider.attach(lockedToken),
              };
            }
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
          currentValidAddress.current = node.daoAddress;
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
          currentValidAddress.current = node.daoAddress;
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
          currentValidAddress.current = node.daoAddress;
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
        }
      } else {
        currentValidAddress.current = node.daoAddress;
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
      }
    }
  }, [
    action,
    provider,
    signerOrProvider,
    votesTokenMasterCopyContract,
    fractalAzoriusMasterCopyContract,
    votesERC20WrapperMasterCopyContract,
    node,
    getZodiacModuleProxyMasterCopyData,
    linearVotingMasterCopyContract,
    linearVotingERC721MasterCopyContract,
  ]);

  useEffect(() => {
    if (
      (!!node.daoAddress &&
        node.isModulesLoaded &&
        node.daoAddress !== currentValidAddress.current) ||
      lastChainId !== chainId
    ) {
      setLastChainId(chainId);
      loadGovernanceContracts();
    }
  }, [node, loadGovernanceContracts, lastChainId, chainId]);
};
