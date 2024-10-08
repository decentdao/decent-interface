import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Address, encodeFunctionData, isHex, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import GnosisSafeL2Abi from '../../assets/abi/GnosisSafeL2';
import MultiSendCallOnlyAbi from '../../assets/abi/MultiSendCallOnly';
import { SENTINEL_ADDRESS } from '../../constants/common';
import { DAO_ROUTES } from '../../constants/routes';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  AzoriusERC20DAO,
  AzoriusERC721DAO,
  FractalModuleType,
  FractalNode,
  ProposalExecuteData,
  SubDAO,
  VotingStrategyType,
  WithError,
} from '../../types';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import { useMasterCopy } from '../utils/useMasterCopy';
import { useLoadDAONode } from './loaders/useLoadDAONode';
import useSubmitProposal from './proposal/useSubmitProposal';

const useDeployAzorius = () => {
  const navigate = useNavigate();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const {
    contracts: {
      compatibilityFallbackHandler,
      votesErc20WrapperMasterCopy,
      votesErc20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      gnosisSafeProxyFactory,
      gnosisSafeL2Singleton,
      zodiacModuleProxyFactory,
      multiSendCallOnly,
      claimErc20MasterCopy,
      moduleFractalMasterCopy,
      linearVotingErc20MasterCopy,
      linearVotingErc721MasterCopy,
      moduleAzoriusMasterCopy,
      freezeGuardAzoriusMasterCopy,
      freezeGuardMultisigMasterCopy,
      freezeVotingErc20MasterCopy,
      freezeVotingErc721MasterCopy,
      freezeVotingMultisigMasterCopy,
    },
    addressPrefix,
  } = useNetworkConfig();
  const {
    node: {
      daoAddress,
      safe,
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();

  const { t } = useTranslation(['transaction', 'proposalMetadata']);
  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const publicClient = usePublicClient();
  const { loadDao } = useLoadDAONode();

  const deployAzorius = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
      customNonce: number | undefined,
      opts: {
        shouldSetName: boolean;
        shouldSetSnapshot: boolean;
      },
    ) => {
      const { shouldSetName, shouldSetSnapshot } = opts;
      if (!daoAddress || !canUserCreateProposal || !safe || !publicClient) {
        return;
      }

      let parentTokenAddress: Address | undefined;
      let parentStrategyAddress: Address | undefined;
      let parentStrategyType: VotingStrategyType | undefined;
      let attachFractalModule = false;
      let parentNode: FractalNode | undefined;

      if (parentAddress) {
        const loadedParentNode = await loadDao(parentAddress);
        const loadingParentNodeError = (loadedParentNode as WithError).error;
        if (loadingParentNodeError) {
          toast.error(t(loadingParentNodeError));
          return;
        } else {
          parentNode = loadedParentNode as FractalNode;
          const parentAzoriusModule = parentNode.fractalModules.find(
            fractalModule => fractalModule.moduleType === FractalModuleType.AZORIUS,
          );
          if (parentAzoriusModule) {
            const azoriusContract = getContract({
              abi: abis.Azorius,
              address: parentAzoriusModule.moduleAddress,
              client: publicClient,
            });

            // @dev assumes the first strategy is the voting contract
            const strategies = await azoriusContract.read.getStrategies([SENTINEL_ADDRESS, 0n]);
            parentStrategyAddress = strategies[1];

            const masterCopyData = await getZodiacModuleProxyMasterCopyData(parentStrategyAddress);
            if (masterCopyData.isLinearVotingErc20) {
              const votingStrategyContract = getContract({
                abi: abis.LinearERC20Voting,
                client: publicClient,
                address: parentStrategyAddress,
              });
              parentTokenAddress = await votingStrategyContract.read.governanceToken();
              parentStrategyType = VotingStrategyType.LINEAR_ERC20;
            } else if (masterCopyData.isLinearVotingErc721) {
              parentStrategyType = VotingStrategyType.LINEAR_ERC721;
            }
          }

          const parentFractalModule = parentNode.fractalModules.find(
            fractalModule => fractalModule.moduleType === FractalModuleType.FRACTAL,
          );
          if (!parentFractalModule) {
            // If FractalModule is not attached - we'll need to attach it only if it was specified through user input
            attachFractalModule = (daoData as SubDAO).attachFractalModule;
          }
        }
      }

      const txBuilderFactory = new TxBuilderFactory(
        publicClient,
        true,
        daoData,
        compatibilityFallbackHandler,
        votesErc20WrapperMasterCopy,
        votesErc20MasterCopy,
        keyValuePairs,
        fractalRegistry,
        gnosisSafeProxyFactory,
        gnosisSafeL2Singleton,
        zodiacModuleProxyFactory,
        freezeGuardAzoriusMasterCopy,
        freezeGuardMultisigMasterCopy,
        freezeVotingErc20MasterCopy,
        freezeVotingErc721MasterCopy,
        freezeVotingMultisigMasterCopy,
        multiSendCallOnly,
        claimErc20MasterCopy,
        moduleFractalMasterCopy,
        linearVotingErc20MasterCopy,
        linearVotingErc721MasterCopy,
        moduleAzoriusMasterCopy,
        parentAddress || undefined,
        parentTokenAddress,
      );

      txBuilderFactory.setSafeContract(daoAddress);

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder({
        attachFractalModule,
        parentStrategyAddress,
        parentStrategyType,
      });
      const safeTx = await daoTxBuilder.buildAzoriusTx({
        shouldSetName,
        shouldSetSnapshot,
        existingSafeOwners: safe.owners,
      });

      if (!isHex(safeTx)) {
        throw new Error('Encoded safeTx is not a hex string');
      }

      const encodedAddOwnerWithThreshold = encodeFunctionData({
        abi: GnosisSafeL2Abi,
        functionName: 'addOwnerWithThreshold',
        args: [multiSendCallOnly, 1n],
      });

      const encodedMultisend = encodeFunctionData({
        abi: MultiSendCallOnlyAbi,
        functionName: 'multiSend',
        args: [safeTx],
      });

      // @todo - If Safe has subDAOs - we'll need to also swap Guard contracts there.
      // However, it will be possible only if FractalModule is attached
      // Otherwise - we need to provide some UI / UX that will inform user about the impact of modifying governance without ability to swap Guard contracts.

      const proposalData: ProposalExecuteData = {
        targets: [daoAddress, multiSendCallOnly],
        values: [0n, 0n],
        calldatas: [encodedAddOwnerWithThreshold, encodedMultisend],
        metaData: {
          title: '',
          description: '',
          documentationUrl: '',
        },
      };

      await submitProposal({
        proposalData,
        nonce: customNonce || safe.nonce,
        pendingToastMessage: t('modifyGovernanceSetAzoriusProposalPendingMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
        failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
        successCallback: () => navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)),
      });
    },
    [
      daoAddress,
      canUserCreateProposal,
      safe,
      publicClient,
      compatibilityFallbackHandler,
      votesErc20WrapperMasterCopy,
      votesErc20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      gnosisSafeProxyFactory,
      gnosisSafeL2Singleton,
      zodiacModuleProxyFactory,
      freezeGuardAzoriusMasterCopy,
      freezeGuardMultisigMasterCopy,
      freezeVotingErc20MasterCopy,
      freezeVotingErc721MasterCopy,
      freezeVotingMultisigMasterCopy,
      multiSendCallOnly,
      claimErc20MasterCopy,
      moduleFractalMasterCopy,
      linearVotingErc20MasterCopy,
      linearVotingErc721MasterCopy,
      moduleAzoriusMasterCopy,
      submitProposal,
      t,
      navigate,
      addressPrefix,
      loadDao,
      getZodiacModuleProxyMasterCopyData,
      parentAddress,
    ],
  );

  return deployAzorius;
};

export default useDeployAzorius;
