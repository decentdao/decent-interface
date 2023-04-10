import {
  FractalUsul,
  ModuleProxyFactory,
  OZLinearVoting,
  VotesToken,
} from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { ContractConnection, FractalModuleType, FractalNode } from '../../../types';
import { useLocalStorage } from '../../utils/useLocalStorage';

const USUL_MODULE_CACHE_KEY = 'usul_module_gov_';
export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const {
    node,
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      votesTokenMasterCopyContract,
      fractalUsulMasterCopyContract,
    },
    action,
  } = useFractal();

  const {
    network: { chainId },
  } = useProvider();

  const { setValue, getValue } = useLocalStorage();

  const loadGovernanceContracts = useCallback(
    async (_node: FractalNode) => {
      const { fractalModules } = _node;

      const usulModule = fractalModules.find(module => module.moduleType === FractalModuleType.USUL)
        ?.moduleContract as FractalUsul | undefined;
      if (!!usulModule) {
        const usulContract = {
          asProvider: fractalUsulMasterCopyContract.asProvider.attach(usulModule.address),
          asSigner: fractalUsulMasterCopyContract.asSigner.attach(usulModule.address),
        };
        const cachedContractAddresses = getValue('usul_module_gov_' + usulModule.address);

        // if existing cached addresses are found, use them
        let votingContractAddress: string | undefined =
          cachedContractAddresses?.votingContractAddress;

        let votingContractMasterCopyAddress: string | undefined =
          cachedContractAddresses?.votingContractMasterCopyAddress;
        let govTokenAddress: string | undefined = cachedContractAddresses?.govTokenContractAddress;

        let ozLinearVotingContract: ContractConnection<OZLinearVoting> | undefined;
        let tokenContract: ContractConnection<VotesToken> | undefined;

        if (!votingContractAddress) {
          votingContractAddress = await getEventRPC<FractalUsul>(usulContract, chainId)
            .queryFilter(usulModule.filters.EnabledStrategy())
            .then(strategiesEnabled => {
              return strategiesEnabled[0].args.strategy;
            });
        }

        if (!votingContractMasterCopyAddress) {
          const rpc = getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract, chainId);
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
        }
        if (ozLinearVotingContract) {
          if (!govTokenAddress) {
            govTokenAddress = await ozLinearVotingContract.asSigner.governanceToken();
          }
          tokenContract = {
            asSigner: votesTokenMasterCopyContract.asSigner.attach(govTokenAddress),
            asProvider: votesTokenMasterCopyContract.asProvider.attach(govTokenAddress),
          };
        }
        if (!!ozLinearVotingContract && !!tokenContract) {
          // cache the addresses for future use, saves on query requests
          setValue(USUL_MODULE_CACHE_KEY + usulModule.address, {
            votingContractAddress,
            govTokenAddress,
            votingContractMasterCopyAddress,
          });

          action.dispatch({
            type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
            payload: {
              ozLinearVotingContract,
              usulContract,
              tokenContract,
            },
          });
        } else {
          action.dispatch({
            type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
            payload: {
              ozLinearVotingContract: null,
              usulContract: null,
              tokenContract: null,
            },
          });
        }
      } else {
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContract: null,
            usulContract: null,
            tokenContract: null,
          },
        });
      }
    },
    [
      chainId,
      action,
      getValue,
      setValue,
      linearVotingMasterCopyContract,
      votesTokenMasterCopyContract,
      zodiacModuleProxyFactoryContract,
      fractalUsulMasterCopyContract,
    ]
  );

  useEffect(() => {
    if (!!node.daoAddress && node.daoAddress !== currentValidAddress.current) {
      // load governance contracts for DAO
      currentValidAddress.current = node.daoAddress;
      loadGovernanceContracts(node);
    }
  }, [node, loadGovernanceContracts]);
  return;
};
