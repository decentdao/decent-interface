import { Azorius } from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  isAddress,
  getAddress,
  encodeAbiParameters,
  parseAbiParameters,
  isHex,
  encodeFunctionData,
} from 'viem';
import { useWalletClient } from 'wagmi';
import MultiSendCallOnlyAbi from '../../../assets/abi/MultiSendCallOnly';
import { ADDRESS_MULTISIG_METADATA, SENTINEL_ADDRESS } from '../../../constants/common';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { MetaTransaction, ProposalExecuteData, CreateProposalMetadata } from '../../../types';
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
  successCallback?: (addressPrefix: string, daoAddress: string) => void;
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
  const loadDAOProposals = useDAOProposals();
  const signer = useEthersSigner();
  const { data: walletClient } = useWalletClient();

  const {
    node: { safe, fractalModules },
    guardContracts: { freezeVotingContractAddress },
    governanceContracts: { ozLinearVotingContractAddress, erc721LinearVotingContractAddress },
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
  const {
    chain,
    safeBaseURL,
    addressPrefix,
    contracts: { multisend: multiSendCallOnly },
  } = useNetworkConfig();
  const ipfsClient = useIPFSClient();

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
      if (!proposalData || !walletClient) {
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
      try {
        if (
          proposalData.metaData.title ||
          proposalData.metaData.description ||
          proposalData.metaData.documentationUrl
        ) {
          const metaData: CreateProposalMetadata = {
            title: proposalData.metaData.title || '',
            description: proposalData.metaData.description || '',
            documentationUrl: proposalData.metaData.documentationUrl || '',
          };
          const { Hash } = await ipfsClient.add(JSON.stringify(metaData));
          proposalData.targets.push(ADDRESS_MULTISIG_METADATA);
          proposalData.values.push(0n);
          proposalData.calldatas.push(encodeAbiParameters(parseAbiParameters(['string']), [Hash]));
        }

        let to = proposalData.targets[0];
        let value = proposalData.values[0];
        let data = proposalData.calldatas[0];
        let operation: 0 | 1 = 0;

        if (proposalData.targets.length > 1) {
          // Need to wrap it in Multisend function call
          to = multiSendCallOnly;
          value = 0n;

          const tempData = proposalData.targets.map((target, index) => {
            return {
              to: target,
              value: proposalData.values[index],
              data: proposalData.calldatas[index],
              operation: 0,
            } as MetaTransaction;
          });

          data = encodeFunctionData({
            abi: MultiSendCallOnlyAbi,
            functionName: 'multiSend',
            args: [encodeMultiSend(tempData)],
          });

          if (!isHex(data)) {
            throw new Error('Error encoding proposal data');
          }

          operation = 1;
        }

        await axios.post(
          buildSafeApiUrl(safeBaseURL, `/safes/${safeAddress}/multisig-transactions/`),
          await buildSafeAPIPost(getAddress(safeAddress), walletClient, chain.id, {
            to,
            value,
            data,
            operation,
            nonce,
          }),
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadDAOProposals();
        if (successCallback) {
          successCallback(addressPrefix, safeAddress);
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
    [
      addressPrefix,
      chain.id,
      ipfsClient,
      loadDAOProposals,
      multiSendCallOnly,
      safeBaseURL,
      signerOrProvider,
      walletClient,
    ],
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
              title: proposalData.metaData.title,
              description: proposalData.metaData.description,
              documentationUrl: proposalData.metaData.documentationUrl,
            }),
          )
        ).wait();
        toast.dismiss(toastId);
        toast(successToastMessage);
        if (successCallback) {
          successCallback(addressPrefix, safeAddress!);
        }
      } catch (e) {
        toast.dismiss(toastId);
        toast(failedToastMessage);
        logError(e, 'Error during Azorius proposal creation');
      } finally {
        setPendingCreateTx(false);
      }
    },
    [addressPrefix],
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
      if (!proposalData || !safeAPI) {
        return;
      }

      if (safeAddress && isAddress(safeAddress)) {
        // Submitting proposal to any DAO out of global context
        const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
        const modules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(modules);
        if (!azoriusModule) {
          await submitMultisigProposal({
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
          // @dev assumes the first strategy is the voting contract
          const votingStrategyAddress = (
            await azoriusModuleContract.getStrategies(SENTINEL_ADDRESS, 0)
          )[1];
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
          ozLinearVotingContractAddress ||
          erc721LinearVotingContractAddress ||
          freezeVotingContractAddress;

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
      freezeVotingContractAddress,
      safe,
      lookupModules,
      submitMultisigProposal,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
      submitAzoriusProposal,
      safeAPI,
    ],
  );

  return { submitProposal, pendingCreateTx };
}
