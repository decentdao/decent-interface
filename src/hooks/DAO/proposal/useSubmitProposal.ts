import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { FractalUsul, GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { BigNumber, Signer } from 'ethers';
import { getAddress } from 'ethers/lib/utils.js';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useProvider, useSigner } from 'wagmi';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalModuleType, MetaTransaction, ProposalExecuteData } from '../../../types';
import { buildGnosisApiUrl } from '../../../utils';
import { useFractalModules } from '../loaders/useFractalModules';

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

interface ISubmitTokenVotingProposal extends ISubmitProposal {
  /**
   * @param usulContract - provided usul contract.
   * Depending on safeAddress it's either picked from global context
   * either grabbed from the safe info from Safe API.
   */
  usulContract: FractalUsul;
  /**
   * @param votingStrategyAddress - provided voting strategy address for proposal submission.
   * Depending on safeAddress it's either picked from global context
   * either grabbed from the safe info from Safe API & provided Usul contract.
   */
  votingStrategyAddress: string;
}

export default function useSubmitProposal() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);

  const {
    node: { safe, fractalModules },
    baseContracts: { multiSendContract },
    guardContracts: { vetoVotingContract },
    governanceContracts: { ozLinearVotingContract },
    clients: { safeService },
  } = useFractal();

  const globalUsulContract = useMemo(() => {
    const usulModule = fractalModules?.find(module => module.moduleType === FractalModuleType.USUL);
    if (!usulModule) {
      return undefined;
    }
    return usulModule.moduleContract as FractalUsul;
  }, [fractalModules]);

  const lookupModules = useFractalModules();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const { chainId, safeBaseURL } = useNetworkConfg();

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

      if (!safeAddress || !signerOrProvider || !nonce) {
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
        const gnosisContract = GnosisSafe__factory.connect(safeAddress, signerOrProvider);
        await axios.post(
          buildGnosisApiUrl(safeBaseURL, `/safes/${safeAddress}/multisig-transactions/`),
          await buildSafeAPIPost(
            gnosisContract,
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
    [chainId, multiSendContract, safeBaseURL, signerOrProvider]
  );

  const submitTokenVotingProposal = useCallback(
    async ({
      proposalData,
      usulContract,
      votingStrategyAddress,
      pendingToastMessage,
      successToastMessage,
      successCallback,
      failedToastMessage,
      safeAddress,
    }: ISubmitTokenVotingProposal) => {
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

        // @todo: Implement voting strategy proposal selection when/if we will support multiple strategies on single Usul instance
        await (
          await usulContract.submitProposalWithMetaData(
            votingStrategyAddress,
            '0x',
            transactions,
            proposalData.title,
            proposalData.description,
            proposalData.documentationUrl
          )
        ).wait();
        if (successCallback) {
          successCallback(safeAddress!);
        }
        toast.dismiss(toastId);
        toast(successToastMessage);
      } catch (e) {
        toast.dismiss(toastId);
        toast(failedToastMessage);
        logError(e, 'Error during Usul proposal creation');
      } finally {
        setPendingCreateTx(false);
      }
    },
    []
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

      if (safeAddress && safeService) {
        // Submitting proposal to any DAO out of global context
        const safeInfo = await safeService.getSafeInfo(getAddress(safeAddress));
        const modules = await lookupModules(safeInfo.modules);
        const usulModule = modules.find(module => module.moduleType === FractalModuleType.USUL);
        if (!usulModule) {
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
          submitTokenVotingProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            safeAddress,
            usulContract: usulModule.moduleContract as FractalUsul,
            votingStrategyAddress: ozLinearVotingContract?.asSigner.address!,
          });
        }
      } else {
        if (!globalUsulContract || !vetoVotingContract || !safe?.address) {
          submitMultisigProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            safeAddress: safe?.address,
          });
        } else {
          submitTokenVotingProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            usulContract: globalUsulContract,
            votingStrategyAddress: vetoVotingContract.asSigner.address,
            safeAddress: safe.address,
          });
        }
      }
    },
    [
      globalUsulContract,
      vetoVotingContract,
      safe,
      lookupModules,
      submitMultisigProposal,
      ozLinearVotingContract,
      submitTokenVotingProposal,
      safeService,
    ]
  );

  return { submitProposal, pendingCreateTx, canUserCreateProposal: true };
}
