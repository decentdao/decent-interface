import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { BigNumber, Signer } from 'ethers';
import { useCallback, useState } from 'react';
import { buildSafeAPIPost, encodeMultiSend } from '../../../helpers';

import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { buildGnosisApiUrl } from '../../../providers/Fractal/utils';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { MetaTransaction, ProposalExecuteData } from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';
import useUsul from './useUsul';

export default function useSubmitProposal() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);

  const { multiSendContract } = useSafeContracts();
  const { usulContract, votingStrategiesAddresses } = useUsul();
  const {
    gnosis: { safe },
  } = useFractal();
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();
  const submitProposal = useCallback(
    async ({
      proposalData,
      successCallback,
    }: {
      proposalData: ProposalExecuteData | undefined;
      successCallback: (daoAddress: string) => void;
    }) => {
      if (!proposalData) {
        return;
      }

      if (!usulContract || !votingStrategiesAddresses || !safe.address) {
        // Submit a multisig proposal

        if (!safe.address || !signerOrProvider || !multiSendContract) {
          return;
        }

        setPendingCreateTx(true);

        let to, data, operation;
        if (proposalData.targets.length > 1) {
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
          data = proposalData.calldatas[0];
          operation = 0;
        }

        try {
          const gnosisContract = GnosisSafe__factory.connect(safe.address, signerOrProvider);
          await axios.post(
            buildGnosisApiUrl(chainId, `/safes/${safe.address}/multisig-transactions/`),
            await buildSafeAPIPost(
              gnosisContract,
              signerOrProvider as Signer & TypedDataSigner,
              chainId,
              {
                to,
                data,
                operation,
                nonce: (await gnosisContract.nonce()).toNumber(),
              }
            )
          );
          successCallback(safe.address);
        } catch (e) {
          logError(e, 'Error during Multi-sig proposal creation');
        } finally {
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
          successCallback(safe.address);
        } catch (e) {
          logError(e, 'Error during Usul proposal creation');
        } finally {
          setPendingCreateTx(false);
        }
      }
    },
    [chainId, safe, signerOrProvider, usulContract, votingStrategiesAddresses, multiSendContract]
  );

  return { submitProposal, pendingCreateTx, canUserCreateProposal: true };
}
