import { TypedDataSigner } from '@ethersproject/abstract-signer';
import {
  Azorius,
  BaseStrategy__factory,
  GnosisSafe__factory,
} from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { BigNumber, Signer, utils } from 'ethers';
import { getAddress, isAddress } from 'ethers/lib/utils';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSigner } from 'wagmi';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { MetaTransaction, ProposalExecuteData, GovernanceSelectionType } from '../../../types';
import { buildSafeApiUrl, getAzoriusModuleFromModules } from '../../../utils';
import useSignerOrProvider from '../../utils/useSignerOrProvider';
import { useFractalModules } from '../loaders/useFractalModules';
import { useDAOProposals } from '../loaders/useProposals';

interface ISubmitProposal {
  proposalData: ProposalExecuteData | undefined;
  nonce: number | undefined;
  pendingToastMessage: string;
  failedToastMessage: string;
  successToastMessage: string;
  successCallback?: (daoAddress: string) => void;
  /**
   * @param safeAddress - provided address of DAO to which proposal will be submitted
   */
  safeAddress?: string;
}

interface ISubmitAzoriusProposal extends ISubmitProposal {
  /**
   * @param azoriusContract - provided Azorius contract.
   * Depending on safeAddress it's either picked from global context
   * either grabbed from the safe info from Safe API.
   */
  azoriusContract: Azorius;
  /**
   * @param votingStrategyAddress - provided voting strategy address for proposal submission.
   * Depending on safeAddress it's either picked from global context
   * either grabbed from the safe info from Safe API & provided Azorius contract.
   */
  votingStrategyAddress: string;
}

export default function useSubmitProposal() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);
  const loadDAOProposals = useDAOProposals();
  const { data: signer } = useSigner();

  const {
    node: { safe, fractalModules },
    baseContracts: { multiSendContract },
    guardContracts: { freezeVotingContract },
    governanceContracts: { ozLinearVotingContract, erc721LinearVotingContract },
    governance: { type },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();

  const globalAzoriusContract = useMemo(() => {
    if (!signer) {
      return undefined;
    }
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);
    if (!azoriusModule) {
      return undefined;
    }
    const moduleContract = azoriusModule.moduleContract as Azorius;
    return moduleContract.connect(signer);
  }, [fractalModules, signer]);

  const lookupModules = useFractalModules();
  const signerOrProvider = useSignerOrProvider();
  const { chainId, safeBaseURL } = useNetworkConfig();

  const getCanUserCreateProposal = useCallback(
    async (safeAddress?: string): Promise<boolean> => {
      if (!user.address) {
        return false;
      }

      const checkIsMultisigOwner = (owners?: string[]) => {
        return !!owners?.includes(user.address || '');
      };

      if (safeAddress) {
        const safeInfo = await safeAPI.getSafeInfo(utils.getAddress(safeAddress));
        const safeModules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(safeModules);

        if (azoriusModule && azoriusModule.moduleContract) {
          const azoriusContract = azoriusModule.moduleContract as Azorius;
          const votingContractAddress = await azoriusContract
            .queryFilter(azoriusContract.filters.EnabledStrategy())
            .then(strategiesEnabled => {
              return strategiesEnabled[0].args.strategy;
            });
          const votingContract = BaseStrategy__factory.connect(
            votingContractAddress,
            signerOrProvider
          );
          const isProposer = await votingContract.isProposer(user.address);
          return isProposer;
        } else {
          return checkIsMultisigOwner(safeInfo.owners);
        }
      } else {
        if (type === GovernanceSelectionType.MULTISIG) {
          const { owners } = safe || {};
          return checkIsMultisigOwner(owners);
        } else if (type === GovernanceSelectionType.AZORIUS_ERC20) {
          if (ozLinearVotingContract && user.address) {
            return ozLinearVotingContract.asSigner.isProposer(user.address);
          }
        } else if (type === GovernanceSelectionType.AZORIUS_ERC721) {
          if (erc721LinearVotingContract) {
            return erc721LinearVotingContract.asSigner.isProposer(user.address);
          }
        } else {
          return false;
        }
      }
      return false;
    },
    [
      safe,
      type,
      user,
      ozLinearVotingContract,
      erc721LinearVotingContract,
      lookupModules,
      safeAPI,
      signerOrProvider,
    ]
  );
  useEffect(() => {
    const loadCanUserCreateProposal = async () => {
      setCanUserCreateProposal(await getCanUserCreateProposal());
    };
    loadCanUserCreateProposal();
  }, [getCanUserCreateProposal]);

  const submitMultisigProposal = useCallback(
    async ({
      pendingToastMessage,
      successToastMessage,
      failedToastMessage,
      nonce,
      proposalData,
      successCallback,
      safeAddress,
    }: ISubmitProposal) => {
      if (!proposalData) {
        return;
      }

      const toastId = toast(pendingToastMessage, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        progress: 1,
      });

      if (!safeAddress || !signerOrProvider || nonce === undefined) {
        toast.dismiss(toastId);
        return;
      }

      setPendingCreateTx(true);

      let to, value, data, operation;
      if (proposalData.targets.length > 1) {
        if (!multiSendContract) {
          toast.dismiss(toastId);
          return;
        }
        // Need to wrap it in Multisend function call
        to = multiSendContract.asSigner.address;

        const tempData = proposalData.targets.map((target, index) => {
          return {
            to: target,
            value: BigNumber.from(proposalData.values[index]),
            data: proposalData.calldatas[index],
            operation: 0,
          } as MetaTransaction;
        });

        data = multiSendContract.asSigner.interface.encodeFunctionData('multiSend', [
          encodeMultiSend(tempData),
        ]);

        operation = 1;
      } else {
        // Single transaction to post
        to = proposalData.targets[0];
        value = BigNumber.from(proposalData.values[0]);
        data = proposalData.calldatas[0];
        operation = 0;
      }

      try {
        const safeContract = GnosisSafe__factory.connect(safeAddress, signerOrProvider);
        await axios.post(
          buildSafeApiUrl(safeBaseURL, `/safes/${safeAddress}/multisig-transactions/`),
          await buildSafeAPIPost(
            safeContract,
            signerOrProvider as Signer & TypedDataSigner,
            chainId,
            {
              to,
              value,
              data,
              operation,
              nonce,
            }
          )
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadDAOProposals();
        if (successCallback) {
          successCallback(safeAddress);
        }
        toast(successToastMessage);
      } catch (e) {
        toast(failedToastMessage);
        logError(e, 'Error during Multi-sig proposal creation');
      } finally {
        toast.dismiss(toastId);
        setPendingCreateTx(false);
        return;
      }
    },
    [chainId, multiSendContract, safeBaseURL, signerOrProvider, loadDAOProposals]
  );

  const submitAzoriusProposal = useCallback(
    async ({
      proposalData,
      azoriusContract,
      votingStrategyAddress,
      pendingToastMessage,
      successToastMessage,
      successCallback,
      failedToastMessage,
      safeAddress,
    }: ISubmitAzoriusProposal) => {
      if (!proposalData) {
        return;
      }
      const toastId = toast(pendingToastMessage, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        progress: 1,
      });

      setPendingCreateTx(true);
      try {
        const transactions = proposalData.targets.map((target, index) => ({
          to: target,
          value: proposalData.values[index],
          data: proposalData.calldatas[index],
          operation: 0,
        }));

        // @todo: Implement voting strategy proposal selection when/if we will support multiple strategies on single Azorius instance
        await (
          await azoriusContract.submitProposal(
            votingStrategyAddress,
            '0x',
            transactions,
            JSON.stringify({
              title: proposalData.title,
              description: proposalData.description,
              documentationUrl: proposalData.documentationUrl,
            })
          )
        ).wait();
        await loadDAOProposals();
        if (successCallback) {
          successCallback(safeAddress!);
        }
        toast.dismiss(toastId);
        toast(successToastMessage);
      } catch (e) {
        toast.dismiss(toastId);
        toast(failedToastMessage);
        logError(e, 'Error during Azorius proposal creation');
      } finally {
        setPendingCreateTx(false);
      }
    },
    [loadDAOProposals]
  );

  const submitProposal = useCallback(
    async ({
      proposalData,
      nonce,
      pendingToastMessage,
      failedToastMessage,
      successToastMessage,
      successCallback,
      safeAddress,
    }: ISubmitProposal) => {
      if (!proposalData) {
        return;
      }

      if (safeAddress && isAddress(safeAddress)) {
        // Submitting proposal to any DAO out of global context
        const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
        const modules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(modules);
        if (!azoriusModule) {
          submitMultisigProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            safeAddress,
          });
        } else {
          const azoriusModuleContract = azoriusModule.moduleContract as Azorius;
          const votingStrategyAddress = await azoriusModuleContract
            .queryFilter(azoriusModuleContract.filters.EnabledStrategy())
            .then(strategiesEnabled => {
              return strategiesEnabled[0].args.strategy;
            });
          submitAzoriusProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            safeAddress,
            azoriusContract: azoriusModule.moduleContract as Azorius,
            votingStrategyAddress,
          });
        }
      } else {
        const votingStrategyAddress =
          ozLinearVotingContract?.asSigner.address ||
          erc721LinearVotingContract?.asSigner.address ||
          freezeVotingContract?.asSigner.address;

        if (!globalAzoriusContract || !votingStrategyAddress) {
          await submitMultisigProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            safeAddress: safe?.address,
          });
        } else {
          await submitAzoriusProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            votingStrategyAddress,
            azoriusContract: globalAzoriusContract,
            safeAddress: safe?.address,
          });
        }
      }
    },
    [
      globalAzoriusContract,
      freezeVotingContract,
      safe,
      lookupModules,
      submitMultisigProposal,
      ozLinearVotingContract,
      erc721LinearVotingContract,
      submitAzoriusProposal,
      safeAPI,
    ]
  );

  return { submitProposal, pendingCreateTx, canUserCreateProposal, getCanUserCreateProposal };
}
