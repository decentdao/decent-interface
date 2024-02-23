import {
  Azorius,
  ModuleProxyFactory,
  LinearERC20Voting,
  VotesERC20,
  VotesERC20Wrapper,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LockRelease, LockRelease__factory } from '../../../assets/typechain-types/dcnt';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { ContractConnection } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';
import { useEthersProvider } from '../../utils/useEthersProvider';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

const AZORIUS_MODULE_CACHE_KEY = 'azorius_module_gov_';
export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const {
    node,
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      linearVotingERC721MasterCopyContract,
      votesTokenMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
    },
    action,
  } = useFractal();

  const provider = useEthersProvider();
  const signerOrProvider = useSignerOrProvider();
  const {
    network: { chainId },
  } = provider;

  const [lastChainId, setLastChainId] = useState<number>();

  const { setValue, getValue } = useLocalStorage();

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
        const cachedContractAddresses = getValue(
          'azorius_module_gov_' + azoriusModuleContract.address
        );

        // if existing cached addresses are found, use them
        let votingContractAddress: string | undefined =
          cachedContractAddresses?.votingContractAddress;

        let votingContractMasterCopyAddress: string | undefined =
          cachedContractAddresses?.votingContractMasterCopyAddress;
        let govTokenAddress: string | undefined = cachedContractAddresses?.govTokenContractAddress;

        let ozLinearVotingContract: ContractConnection<LinearERC20Voting> | undefined;
        let erc721LinearVotingContract: ContractConnection<LinearERC721Voting> | undefined;
        let tokenContract: ContractConnection<VotesERC20 | VotesERC20Wrapper> | undefined;
        let underlyingTokenAddress: string | undefined;
        let lockReleaseContract: ContractConnection<LockRelease> | null = null;

        if (!votingContractAddress) {
          votingContractAddress = (
            await azoriusContract.asProvider.getStrategies(
              '0x0000000000000000000000000000000000000001',
              0
            )
          )[1];
        }

        if (!votingContractMasterCopyAddress) {
          const rpc = getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract);
          const filter = rpc.filters.ModuleProxyCreation(votingContractAddress, null);
          votingContractMasterCopyAddress = await rpc.queryFilter(filter).then(proxiesCreated => {
            return proxiesCreated[0].args.masterCopy;
          });
        }

        if (votingContractMasterCopyAddress === linearVotingMasterCopyContract.asProvider.address) {
          ozLinearVotingContract = {
            asSigner: linearVotingMasterCopyContract.asSigner.attach(votingContractAddress!),
            asProvider: linearVotingMasterCopyContract.asProvider.attach(votingContractAddress!),
          };
        } else if (
          votingContractMasterCopyAddress ===
          linearVotingERC721MasterCopyContract.asProvider.address
        ) {
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
          // cache the addresses for future use, saves on query requests
          setValue(AZORIUS_MODULE_CACHE_KEY + azoriusModuleContract.address, {
            votingContractAddress,
            govTokenAddress,
            underlyingTokenAddress,
            votingContractMasterCopyAddress,
          });
          currentValidAddress.current = node.daoAddress;
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
          setValue(AZORIUS_MODULE_CACHE_KEY + azoriusModuleContract.address, {
            votingContractAddress,
            votingContractMasterCopyAddress,
          });
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
          setValue(AZORIUS_MODULE_CACHE_KEY + azoriusModuleContract.address, {
            votingContractAddress,
            votingContractMasterCopyAddress,
          });
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
    getValue,
    setValue,
    provider,
    signerOrProvider,
    linearVotingMasterCopyContract,
    votesTokenMasterCopyContract,
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    votesERC20WrapperMasterCopyContract,
    linearVotingERC721MasterCopyContract,
    node,
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
