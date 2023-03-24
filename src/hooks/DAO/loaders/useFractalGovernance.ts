import { useEffect, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { useDAOProposals } from './useDAOProposals';

export const useFractalGovernance = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();

  const {
    node: { daoAddress },
    governanceContracts,
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  useEffect(() => {
    const { isLoaded } = governanceContracts;
    if (isLoaded && !!daoAddress && daoAddress !== currentValidAddress.current) {
      currentValidAddress.current = daoAddress;
      // load DAO proposals
      const proposals = loadDAOProposals();
      // load DAO voting strategy data
      // load voting token
    }
  }, [daoAddress, governanceContracts, loadDAOProposals]);
};
