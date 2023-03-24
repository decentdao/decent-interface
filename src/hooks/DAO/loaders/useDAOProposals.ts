import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { useAzuriousProposals } from './governance/useAzuriousProposals';

export const useDAOProposals = () => {
  const { governanceContracts } = useFractal();

  const loadAzuriousProposals = useAzuriousProposals();

  const loadDAOProposals = useCallback(() => {
    const { usulContract } = governanceContracts;

    if (!!usulContract) {
      // load Usul proposals and strategies
      return loadAzuriousProposals();
    } else {
      // load mulisig proposals
    }
  }, [governanceContracts, loadAzuriousProposals]);
  return loadDAOProposals;
};
