import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import axios from 'axios';
import { Signer } from 'ethers';
import { useCallback, useState } from 'react';
import { buildSafeAPIPost } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { ProposalExecuteData } from '../../../types';
import { buildGnosisApiUrl } from '../utils';
import { useFractal } from './useFractal';
import useUsul from './useUsul';

export default function useSubmitProposal() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);

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
        if (!safe.address || !signerOrProvider) {
          return;
        }
        setPendingCreateTx(true);
        try {
          const gnosisContract = await GnosisSafe__factory.connect(safe.address, signerOrProvider);
          await axios.post(
            buildGnosisApiUrl(chainId, `/safes/${safe.address}/multisig-transactions/`),
            await buildSafeAPIPost(
              gnosisContract,
              signerOrProvider as Signer & TypedDataSigner,
              chainId,
              {
                to: proposalData.targets[0],
                data: proposalData.calldatas[0],
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
        setPendingCreateTx(true);
        try {
          const txHashes = await Promise.all(
            proposalData.targets.map(async (target, index) => {
              return usulContract.getTransactionHash(
                target,
                proposalData.values[index],
                proposalData.calldatas[index],
                0
              );
            })
          );
          // @todo: Implement voting strategy proposal selection when we will support multiple strategies on single Usul instance
          await (
            await usulContract.submitProposal(txHashes, votingStrategiesAddresses[0], '0x')
          ).wait(); // Third parameter is optional on Usul
          successCallback(safe.address);
        } catch (e) {
          logError(e, 'Error during Usul proposal creation');
        } finally {
          setPendingCreateTx(false);
        }
      }
    },
    [chainId, safe.address, signerOrProvider, usulContract, votingStrategiesAddresses]
  );

  return { submitProposal, pendingCreateTx, canUserCreateProposal: true };
}
