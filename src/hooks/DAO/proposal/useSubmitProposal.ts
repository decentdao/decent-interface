import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { BigNumber, Signer } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useProvider, useSigner } from 'wagmi';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { buildGnosisApiUrl } from '../../../providers/Fractal/utils';
import { MetaTransaction, ProposalExecuteData } from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';
import useUsul from './useUsul';

export default function useSubmitProposal() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);

  const { multiSendContract } = useSafeContracts();
  const { usulContract, votingStrategiesAddresses } = useUsul();
  const {
    actions: { refreshSafeData },
    gnosis: { safe },
  } = useFractal();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const submitProposal = useCallback(
    async ({
      proposalData,
      pendingToastMessage,
      failedToastMessage,
      successToastMessage,
      successCallback,
    }: {
      proposalData: ProposalExecuteData | undefined;
      pendingToastMessage: string;
      failedToastMessage: string;
      successToastMessage: string;
      successCallback?: (daoAddress: string) => void;
    }) => {
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

      if (!usulContract || !votingStrategiesAddresses || !safe.address) {
        // Submit a multisig proposal

        if (!safe.address || !signerOrProvider) {
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
          to = multiSendContract.address;

          const tempData = proposalData.targets.map((target, index) => {
            return {
              to: target,
              value: BigNumber.from(proposalData.values[index]),
              data: proposalData.calldatas[index],
              operation: 0,
            } as MetaTransaction;
          });

          data = multiSendContract.interface.encodeFunctionData('multiSend', [
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
          const gnosisContract = GnosisSafe__factory.connect(safe.address, signerOrProvider);
          await axios.post(
            buildGnosisApiUrl(
              provider._network.chainId,
              `/safes/${safe.address}/multisig-transactions/`
            ),
            await buildSafeAPIPost(
              gnosisContract,
              signerOrProvider as Signer & TypedDataSigner,
              provider._network.chainId,
              {
                to,
                value,
                data,
                operation,
                nonce: (await gnosisContract.nonce()).toNumber(),
              }
            )
          );
          await refreshSafeData();
          if (successCallback) {
            successCallback(safe.address);
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
      } else {
        // Submit a Usul proposal
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
              votingStrategiesAddresses[0],
              '0x',
              transactions,
              proposalData.title,
              proposalData.description,
              proposalData.documentationUrl
            )
          ).wait();
          if (successCallback) {
            toast.dismiss(toastId);
            successCallback(safe.address);
          }
        } catch (e) {
          toast.dismiss(toastId);
          toast(failedToastMessage);
          logError(e, 'Error during Usul proposal creation');
        } finally {
          setPendingCreateTx(false);
        }
      }
    },
    [
      usulContract,
      votingStrategiesAddresses,
      safe.address,
      signerOrProvider,
      multiSendContract,
      refreshSafeData,
      provider,
    ]
  );

  return { submitProposal, pendingCreateTx, canUserCreateProposal: true };
}
