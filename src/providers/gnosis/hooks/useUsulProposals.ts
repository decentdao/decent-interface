import { TypedListener } from '@fractal-framework/core-contracts/dist/common';
import { useState, useEffect, useCallback } from 'react';
import { Usul, Usul__factory } from '../../../assets/typechain-types/usul';
import { ProposalCreatedEvent } from '../../../assets/typechain-types/usul/contracts/Usul';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorLogging';
import { ProposalExecuteData } from '../../../types/proposal';
import { useFractal } from '../../fractal/hooks/useFractal';
import { Proposal } from '../types/usul';

export default function useUsulProposals() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);
  const [usulContract, setUsulContract] = useState<Usul>();
  const [votingStrategiesAddresses, setVotingStrategiesAddresses] = useState<string[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>();

  const {
    state: { signerOrProvider },
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
      successCallback: () => void;
    }) => {
      if (!usulContract || !votingStrategiesAddresses || !proposalData) {
        return;
      }

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
        await usulContract.submitProposal(txHashes, votingStrategiesAddresses[0], '0x'); // Third parameter is optional on Usul
        successCallback();
      } catch (e) {
        logError(e, 'Error during Usul proposal creation');
      }
    },
    [usulContract, votingStrategiesAddresses]
  );

  useEffect(() => {
    const init = async () => {
      if (!safe || !signerOrProvider) {
        return;
      }
      safe.modules?.forEach(async moduleAddress => {
        const moduleContract = Usul__factory.connect(moduleAddress, signerOrProvider);
        try {
          // Little trick to figure out is the Zodiac Module is actually Usul module
          // Method fails if module don't have getStrategiesPaginated - which is quite specific to Usul
          // Known issue - if other contract will have same method - we will have contracts messed up :(
          const [strategies] = await moduleContract.getStrategiesPaginated(
            '0x0000000000000000000000000000000000000001',
            10
          );
          setUsulContract(moduleContract);
          setVotingStrategiesAddresses(strategies);
        } catch (e) {
          console.error(e);
        }
      });
    };
    init();
  }, [safe, signerOrProvider]);

  useEffect(() => {
    if (!usulContract) {
      return;
    }

    const filter = usulContract.filters.ProposalCreated();
    const listenerCallback: TypedListener<ProposalCreatedEvent> = (...args) => {
      // TODO: Map proposals to the state
      console.log('Usul Proposal Created Event args:', args);
      setProposals([]);
    };

    usulContract.on(filter, listenerCallback);

    return () => {
      usulContract.off(filter, listenerCallback);
    };
  }, [usulContract]);

  return {
    proposals,
    pendingCreateTx,
    submitProposal,
    canUserCreateProposal: true,
  };
}
