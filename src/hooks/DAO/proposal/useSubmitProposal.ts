import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { Azorius } from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { BigNumber, Signer, utils } from 'ethers';
import { getAddress, isAddress } from 'ethers/lib/utils';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GnosisSafeL2__factory } from '../../../assets/typechain-types/usul/factories/@gnosis.pm/safe-contracts/contracts';
import { ADDRESS_MULTISIG_METADATA } from '../../../constants/common';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  MetaTransaction,
  ProposalExecuteData,
  GovernanceType,
  ProposalMetadata,
} from '../../../types';
import { buildSafeApiUrl, getAzoriusModuleFromModules } from '../../../utils';
import useSafeContracts from '../../safe/useSafeContracts';
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
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);
  const loadDAOProposals = useDAOProposals();
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  const {
    node: { safe, fractalModules },
    guardContracts: { freezeVotingContractAddress },
    governanceContracts: { ozLinearVotingContractAddress, erc721LinearVotingContractAddress },
    governance: { type },
    readOnly: { user },
  } = useFractal();
  const baseContracts = useSafeContracts();
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
  const { chainId, safeBaseURL, addressPrefix } = useNetworkConfig();
  const ipfsClient = useIPFSClient();

  /**
   * Performs a check whether user has access rights to create proposal for DAO
   * @param {string} safeAddress - parameter to verify that user can create proposal for this specific DAO.
   * Otherwise - it is checked for DAO from the global context.
   * @returns {Promise<boolean>} - whether or not user has rights to create proposal either in global scope either for provided `safeAddress`.
   */
  const getCanUserCreateProposal = useCallback(
    async (safeAddress?: string): Promise<boolean> => {
      if (!user.address || !safeAPI || !signerOrProvider) {
        return false;
      }

      const checkIsMultisigOwner = (owners?: string[]) => {
        return !!owners?.includes(user.address || '');
      };

      if (safeAddress && baseContracts) {
        const safeInfo = await safeAPI.getSafeInfo(utils.getAddress(safeAddress));
        const safeModules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(safeModules);

        if (azoriusModule && azoriusModule.moduleContract) {
          const azoriusContract = azoriusModule.moduleContract as Azorius;
          // @dev assumes the first strategy is the voting contract
          const votingContractAddress = (
            await azoriusContract.getStrategies('0x0000000000000000000000000000000000000001', 0)
          )[1];
          const votingContract =
            baseContracts.linearVotingMasterCopyContract.asProvider.attach(votingContractAddress);
          const isProposer = await votingContract.isProposer(user.address);
          return isProposer;
        } else {
          return checkIsMultisigOwner(safeInfo.owners);
        }
      } else {
        if (type === GovernanceType.MULTISIG) {
          const { owners } = safe || {};
          return checkIsMultisigOwner(owners);
        } else if (type === GovernanceType.AZORIUS_ERC20) {
          if (ozLinearVotingContractAddress && user.address && baseContracts) {
            const ozLinearVotingContract =
              baseContracts.linearVotingMasterCopyContract.asProvider.attach(
                ozLinearVotingContractAddress,
              );
            return ozLinearVotingContract.isProposer(user.address);
          }
        } else if (
          type === GovernanceType.AZORIUS_ERC721 &&
          baseContracts &&
          erc721LinearVotingContractAddress
        ) {
          const erc721LinearVotingContract =
            baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
              erc721LinearVotingContractAddress,
            );
          return erc721LinearVotingContract.isProposer(user.address);
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
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
      lookupModules,
      safeAPI,
      signerOrProvider,
      baseContracts,
    ],
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
      if (!proposalData || !baseContracts) {
        return;
      }
      const { multiSendContract } = baseContracts;

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
          const metaData: ProposalMetadata = {
            title: proposalData.metaData.title || '',
            description: proposalData.metaData.description || '',
            documentationUrl: proposalData.metaData.documentationUrl || '',
          };
          const { Hash } = await ipfsClient.add(JSON.stringify(metaData));
          proposalData.targets.push(ADDRESS_MULTISIG_METADATA);
          proposalData.values.push(BigNumber.from('0'));
          proposalData.calldatas.push(new utils.AbiCoder().encode(['string'], [Hash]));
        }

        let to, value, data, operation;
        if (proposalData.targets.length > 1) {
          if (!multiSendContract) {
            toast.dismiss(toastId);
            return;
          }
          // Need to wrap it in Multisend function call
          to = multiSendContract.asProvider.address;

          const tempData = proposalData.targets.map((target, index) => {
            return {
              to: target,
              value: BigNumber.from(proposalData.values[index]),
              data: proposalData.calldatas[index],
              operation: 0,
            } as MetaTransaction;
          });

          data = multiSendContract.asProvider.interface.encodeFunctionData('multiSend', [
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

        const safeContract = GnosisSafeL2__factory.connect(safeAddress, signerOrProvider);
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
            },
          ),
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
      signerOrProvider,
      safeBaseURL,
      chainId,
      loadDAOProposals,
      ipfsClient,
      baseContracts,
      addressPrefix,
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
      if (!proposalData || !provider) {
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
    [provider, addressPrefix],
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
          // @dev assumes the first strategy is the voting contract
          const votingStrategyAddress = (
            await azoriusModuleContract.getStrategies(
              '0x0000000000000000000000000000000000000001',
              0,
            )
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

  return { submitProposal, pendingCreateTx, canUserCreateProposal, getCanUserCreateProposal };
}
