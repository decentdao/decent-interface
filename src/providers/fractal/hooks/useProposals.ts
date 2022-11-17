import { TypedDataSigner } from '@ethersproject/abstract-signer';
import axios from 'axios';
import { Signer } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { GnosisSafe__factory } from '../../../assets/typechain-types/fractal-contracts';
import { TypedListener } from '../../../assets/typechain-types/usul/common';
import { ProposalCreatedEvent } from '../../../assets/typechain-types/usul/contracts/Usul';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { buildSafeAPIPost } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { ProposalExecuteData } from '../../../types/proposal';
import { Proposal } from '../types/usul';
import { buildGnosisApiUrl } from '../utils';
import { mapProposalCreatedEventToProposal } from '../utils/usul';
import { useFractal } from './useFractal';
import useUsul from './useUsul';

export default function useProposals() {
  const { usulContract, votingStrategiesAddresses } = useUsul();
  const [pendingCreateTx, setPendingCreateTx] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>();

  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();
  const {
    gnosis: { safe },
  } = useFractal();

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

  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalNumber, proposer) => {
      if (!usulContract || !signerOrProvider) {
        return;
      }
      const proposal = await mapProposalCreatedEventToProposal(
        strategyAddress,
        proposalNumber,
        proposer,
        usulContract,
        signerOrProvider
      );

      setProposals(prevState => {
        if (prevState) {
          return [...prevState, proposal];
        }
        return [proposal];
      });
    },
    [usulContract, signerOrProvider]
  );

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const filter = usulContract.filters.ProposalCreated();

    usulContract.on(filter, proposalCreatedListener);

    return () => {
      usulContract.off(filter, proposalCreatedListener);
    };
  }, [usulContract, signerOrProvider, proposalCreatedListener]);

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const loadProposals = async () => {
      const proposalCreatedFilter = usulContract.filters.ProposalCreated();
      const proposalCreatedEvents = await usulContract.queryFilter(proposalCreatedFilter);
      const mappedProposals = await Promise.all(
        proposalCreatedEvents.map(({ args }) => {
          return mapProposalCreatedEventToProposal(
            args[0],
            args[1],
            args[2],
            usulContract,
            signerOrProvider
          );
        })
      );
      setProposals(mappedProposals);
    };

    loadProposals();
  }, [usulContract, signerOrProvider]);

  return {
    proposals,
    pendingCreateTx,
    submitProposal,
    canUserCreateProposal: true,
  };
}
