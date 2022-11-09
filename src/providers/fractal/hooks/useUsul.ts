import { useState, useCallback, useEffect } from 'react';
import { Usul, Usul__factory } from '../../../assets/typechain-types/usul';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorLogging';
import { ProposalExecuteData } from '../../../types/proposal';
import { GnosisModuleType } from '../types';
import { useFractal } from './useFractal';

export default function useUsul() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);
  const [usulContract, setUsulContract] = useState<Usul>();
  const [votingStrategiesAddresses, setVotingStrategiesAddresses] = useState<string[]>([]);

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const {
    gnosis: { modules },
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
        successCallback();
      } catch (e) {
        logError(e, 'Error during Usul proposal creation');
      } finally {
        setPendingCreateTx(false);
      }
    },
    [usulContract, votingStrategiesAddresses]
  );

  useEffect(() => {
    const init = async () => {
      if (!signerOrProvider || !modules) {
        return;
      }

      const usulModule = modules.find(module => module.moduleType === GnosisModuleType.USUL);

      if (!usulModule) {
        return;
      }

      try {
        const moduleContract = Usul__factory.connect(usulModule.moduleAddress, signerOrProvider);
        const [strategies] = await moduleContract.getStrategiesPaginated(
          '0x0000000000000000000000000000000000000001',
          10
        );

        setUsulContract(moduleContract);
        setVotingStrategiesAddresses(strategies);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [modules, signerOrProvider]);

  return {
    pendingCreateTx,
    usulContract,
    votingStrategiesAddresses,
    submitProposal,
    canUserCreateProposal: true,
  };
}
