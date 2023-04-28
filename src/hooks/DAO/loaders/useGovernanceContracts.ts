import {
  FractalUsul,
  ModuleProxyFactory,
  OZLinearVoting,
  VotesToken,
} from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { VotesERC20Wrapper } from '../../../assets/typechain-types/VotesERC20Wrapper';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { ContractConnection, FractalModuleType, FractalNode } from '../../../types';
import { useLocalStorage } from '../../utils/useLocalStorage';

const AZORIUS_MODULE_CACHE_KEY = 'azorius_module_gov_';
export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const {
    node,
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      votesTokenMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
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

      const azoriusModule = fractalModules.find(
        module => module.moduleType === FractalModuleType.AZORIUS
      )?.moduleContract as FractalUsul | undefined;
      if (!!azoriusModule) {
        const azoriusContract = {
          asProvider: fractalAzoriusMasterCopyContract.asProvider.attach(azoriusModule.address),
          asSigner: fractalAzoriusMasterCopyContract.asSigner.attach(azoriusModule.address),
        };
        const cachedContractAddresses = getValue('azorius_module_gov_' + azoriusModule.address);

        // if existing cached addresses are found, use them
        let votingContractAddress: string | undefined =
          cachedContractAddresses?.votingContractAddress;

        let votingContractMasterCopyAddress: string | undefined =
          cachedContractAddresses?.votingContractMasterCopyAddress;
        let govTokenAddress: string | undefined = cachedContractAddresses?.govTokenContractAddress;

        let ozLinearVotingContract: ContractConnection<OZLinearVoting> | undefined;
        let tokenContract: ContractConnection<VotesToken | VotesERC20Wrapper> | undefined;
        let underlyingTokenAddress: string | undefined;

        if (!votingContractAddress) {
          votingContractAddress = await getEventRPC<FractalUsul>(azoriusContract, chainId)
            .queryFilter(azoriusModule.filters.EnabledStrategy())
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
          const possibleERC20Wrapper =
            votesERC20WrapperMasterCopyContract.asSigner.attach(govTokenAddress);
          underlyingTokenAddress = await possibleERC20Wrapper.underlying().catch(() => undefined);

          if (!underlyingTokenAddress) {
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
          setValue(AZORIUS_MODULE_CACHE_KEY + azoriusModule.address, {
            votingContractAddress,
            govTokenAddress,
            underlyingTokenAddress,
            votingContractMasterCopyAddress,
          });
          currentValidAddress.current = _node.daoAddress;
          action.dispatch({
            type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
            payload: {
              ozLinearVotingContract,
              azoriusContract,
              tokenContract,
              underlyingTokenAddress,
            },
          });
        } else {
          currentValidAddress.current = _node.daoAddress;
          action.dispatch({
            type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
            payload: {
              ozLinearVotingContract: null,
              azoriusContract: null,
              tokenContract: null,
            },
          });
        }
      } else {
        currentValidAddress.current = _node.daoAddress;
        action.dispatch({
          type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT,
          payload: {
            ozLinearVotingContract: null,
            azoriusContract: null,
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
      fractalAzoriusMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
    ]
  );

  useEffect(() => {
    if (
      !!node.daoAddress &&
      node.isModulesLoaded !== undefined &&
      node.daoAddress !== currentValidAddress.current
    ) {
      loadGovernanceContracts(node);
    }
  }, [node, loadGovernanceContracts]);
};
