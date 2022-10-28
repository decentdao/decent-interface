import { useState, useEffect, useCallback } from 'react';
import { Usul, Usul__factory } from '../../../assets/typechain-types/usul';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useFractal } from '../../fractal/hooks/useFractal';
import { Proposal } from '../types/usul';

export default function useUsulProposals() {
  const [pendingCreateTx, setPendingCreateTx] = useState(false);
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);
  const [usulContract, setUsulContract] = useState<Usul>();
  const [proposals, setProposals] = useState<Proposal[]>();

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const {
    gnosis: { safe },
  } = useFractal();

  const submitProposal = useCallback(async () => {
    if (!usulContract) {
      return;
    }
  }, [usulContract]);
  useEffect(() => {
    const init = async () => {
      if (!safe || !signerOrProvider) {
        return;
      }
      safe.modules?.forEach(async moduleAddress => {
        const moduleContract = Usul__factory.connect(moduleAddress, signerOrProvider);
        try {
          // Little trick to figure out is the Zodiac Module is actually Usul module
          // Method fails if module don't have totalProposalCount - which is quite specific to Usul
          await moduleContract.totalProposalCount();
          setUsulContract(moduleContract);
        } catch (e) {
          console.error(e);
        }
      });
    };
    init();
  }, [safe, signerOrProvider]);

  return {
    proposals,
    pendingCreateTx,
    submitProposal,
    canUserCreateProposal,
  };
}
