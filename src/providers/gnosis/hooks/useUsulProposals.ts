import { useState, useEffect, useCallback } from 'react';
import { Usul, Usul__factory } from '../../../assets/typechain-types/usul';
import { ProposalCreatedEvent } from '../../../assets/typechain-types/usul/contracts/Usul';
import { TypedListener } from '../../../assets/typechain-types/usul/common';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorLogging';
import { ProposalExecuteData } from '../../../types/proposal';
import { useFractal } from '../../fractal/hooks/useFractal';
import { Proposal } from '../types/usul';
import { mapProposalCreatedEventToProposal } from '../helpers/usul';

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
        // @todo: Implement voting strategy proposal selection when we will support multiple strategies on single Usul instance
        await (
          await usulContract.submitProposal(txHashes, votingStrategiesAddresses[0], '0x')
        ).wait(); // Third parameter is optional on Usul
        setPendingCreateTx(false);
        successCallback();
      } catch (e) {
        logError(e, 'Error during Usul proposal creation');
      }
    },
    [usulContract, votingStrategiesAddresses]
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
    const init = async () => {
      if (!safe || !signerOrProvider) {
        return;
      }
      safe.modules?.forEach(async moduleAddress => {
        try {
          const moduleContract = Usul__factory.connect(moduleAddress, signerOrProvider);
          // Little trick to figure out is the Zodiac Module is actually Usul module
          // Method fails if module don't have getStrategiesPaginated - which is quite specific to Usul
          // Known issue - if other contract will have same method - we will have contracts messed up :(
          const [strategies] = await moduleContract.getStrategiesPaginated(
            '0x0000000000000000000000000000000000000001',
            10
          );
          const proposalCreatedFilter = moduleContract.filters.ProposalCreated();
          const proposalCreatedEvents = await moduleContract.queryFilter(proposalCreatedFilter);
          const mappedProposals = await Promise.all(
            proposalCreatedEvents.map(({ args }) => {
              return mapProposalCreatedEventToProposal(
                args[0],
                args[1],
                args[2],
                moduleContract,
                signerOrProvider
              );
            })
          );

          setUsulContract(moduleContract);
          setVotingStrategiesAddresses(strategies);
          setProposals(mappedProposals);
        } catch (e) {
          console.error(e);
        }
      });
    };
    init();
  }, [safe, signerOrProvider]);

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

  return {
    proposals,
    pendingCreateTx,
    submitProposal,
    canUserCreateProposal: true,
  };
}
