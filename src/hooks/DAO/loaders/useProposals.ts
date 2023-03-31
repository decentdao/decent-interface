import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { StrategyType } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governanceContracts,
    dispatch,
  } = useFractal();

  const loadAzoriusProposals = useAzoriusProposals();
  const loadSafeMultisigProposals = useSafeMultisigProposals();
  const { setMethodOnInterval } = useUpdateTimer(daoAddress);
  const loadDAOProposals = useCallback(async () => {
    const { usulContract } = governanceContracts;

    if (!!usulContract) {
      // load Usul proposals and strategies
      dispatch.governance({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: { type: StrategyType.GNOSIS_SAFE_USUL, proposals: await loadAzoriusProposals() },
      });
    } else {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    governanceContracts,
    loadAzoriusProposals,
    dispatch,
    loadSafeMultisigProposals,
    setMethodOnInterval,
  ]);

  return loadDAOProposals;
};
