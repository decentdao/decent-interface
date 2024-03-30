import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceType } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governance: { type },
  } = useFractal();

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);
  const loadAzoriusProposals = useAzoriusProposals();
  const loadSafeMultisigProposals = useSafeMultisigProposals();

  const loadDAOProposals = useCallback(async () => {
    clearIntervals();
    if (type === GovernanceType.AZORIUS_ERC20 || type === GovernanceType.AZORIUS_ERC721) {
      // load Azorius proposals and strategies
      await loadAzoriusProposals();
    } else if (type === GovernanceType.MULTISIG) {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [type, loadAzoriusProposals, loadSafeMultisigProposals, setMethodOnInterval, clearIntervals]);

  return loadDAOProposals;
};
