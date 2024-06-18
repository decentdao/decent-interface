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
  getContract,
  Address,
} from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import AzoriusAbi from '../../../assets/abi/Azorius';
import MultiSendCallOnlyAbi from '../../../assets/abi/MultiSendCallOnly';
import { ADDRESS_MULTISIG_METADATA } from '../../../constants/common';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { MetaTransaction, ProposalExecuteData, CreateProposalMetadata } from '../../../types';
import { buildSafeApiUrl, getAzoriusModuleFromModules } from '../../../utils';
import useVotingStrategyAddress from '../../utils/useVotingStrategyAddress';
import { useFractalModules } from '../loaders/useFractalModules';
import { useLoadDAOProposals } from '../loaders/useLoadDAOProposals';

export type SubmitProposalFunction = ({
  proposalData,
  nonce,
  pendingToastMessage,
  failedToastMessage,
  successToastMessage,
  successCallback,
  safeAddress,
}: ISubmitProposal) => Promise<void>;

interface ISubmitProposal {
  proposalData: ProposalExecuteData | undefined;
  nonce: number | undefined;
  pendingToastMessage: string;
  failedToastMessage: string;
  successToastMessage: string;
  successCallback?: (addressPrefix: string, daoAddress: string) => void;
  safeAddress?: string;
}

interface ISubmitAzoriusProposal extends ISubmitProposal {
  azoriusAddress: Address;
  votingStrategyAddress: string;
}

export default function useSubmitProposal() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);
  const loadDAOProposals = useLoadDAOProposals();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  const {
    node: { safe, fractalModules },
    guardContracts: { freezeVotingContractAddress },
    governanceContracts: { linearVotingErc20Address, linearVotingErc721Address },
  } = useFractal();
  const safeAPI = useSafeAPI();

  const globalAzoriusContract = useMemo(() => {
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);
    if (!azoriusModule || !walletClient) {
      return;
    }

    return getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusModule.moduleAddress),
      client: walletClient,
    });
  }, [fractalModules, walletClient]);

  const lookupModules = useFractalModules();
  const {
    chain,
    safeBaseURL,
    addressPrefix,
    contracts: { multiSendCallOnly },
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

      if (!safeAddress || nonce === undefined) {
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
      walletClient,
    ],
  );

  const submitAzoriusProposal = useCallback(
    async ({
      proposalData,
      azoriusAddress,
      votingStrategyAddress,
      pendingToastMessage,
      successToastMessage,
      successCallback,
      failedToastMessage,
      safeAddress,
    }: ISubmitAzoriusProposal) => {
      if (!proposalData || !walletClient || !publicClient) {
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

        const azoriusContract = getContract({
          abi: AzoriusAbi,
          address: azoriusAddress,
          client: walletClient,
        });

        // @todo: Implement voting strategy proposal selection when/if we will support multiple strategies on single Azorius instance
        const txHash = await azoriusContract.write.submitProposal([
          getAddress(votingStrategyAddress),
          '0x',
          transactions,
          JSON.stringify({
            title: proposalData.metaData.title,
            description: proposalData.metaData.description,
            documentationUrl: proposalData.metaData.documentationUrl,
          }),
        ]);

        await publicClient.waitForTransactionReceipt({ hash: txHash });

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
    [addressPrefix, publicClient, walletClient],
  );

  const submitProposal: SubmitProposalFunction = useCallback(
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
        const votingStrategyAddress = await getVotingStrategyAddress(getAddress(safeAddress));
        const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
        const modules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(modules);
        if (!azoriusModule || !votingStrategyAddress) {
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
          await submitAzoriusProposal({
            proposalData,
            pendingToastMessage,
            successToastMessage,
            failedToastMessage,
            nonce,
            successCallback,
            safeAddress,
            azoriusAddress: getAddress(azoriusModule.moduleAddress),
            votingStrategyAddress,
          });
        }
      } else {
        const votingStrategyAddress =
          linearVotingErc20Address || linearVotingErc721Address || freezeVotingContractAddress;

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
            azoriusAddress: globalAzoriusContract.address,
            safeAddress: safe?.address,
          });
        }
      }
    },
    [
      linearVotingErc721Address,
      freezeVotingContractAddress,
      getVotingStrategyAddress,
      globalAzoriusContract,
      lookupModules,
      linearVotingErc20Address,
      safe?.address,
      safeAPI,
      submitAzoriusProposal,
      submitMultisigProposal,
    ],
  );

  return { submitProposal, pendingCreateTx };
}
