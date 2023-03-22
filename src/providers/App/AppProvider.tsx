import { Context, createContext, useContext, useMemo, useReducer } from 'react';
import useSafeContracts from '../../hooks/safe/useSafeContracts';
import { FractalStore } from '../../types';
import { accountReducer, initialAccountState } from './account/reducer';
import { governanceReducer, initialGovernanceState } from './governance/reducer';
import { guardReducer, initialGuardState } from './guard/reducer';
import { useSafeService } from './hooks/useSafeService';
import { initialNodeState, nodeReducer } from './node/reducer';
import { initialTreasuryState, treasuryReducer } from './treasury/reducer';

export const FractalContext = createContext<FractalStore | null>(null);

export const useFractal = (): FractalStore => useContext(FractalContext as Context<FractalStore>);

// @RENAME to FractalProvider
export function AppProvider() {
  // loads base Fractal contracts with provider into state
  const baseContracts = useSafeContracts();
  // loads safe service into state;
  const safeService = useSafeService();
  // handles current viewing node (DAO) state
  const [node, nodeDispatch] = useReducer(nodeReducer, initialNodeState);
  // handles current viewing guard state
  const [guard, guardDispatch] = useReducer(guardReducer, initialGuardState);
  // handles current viewing governance state
  const [governance, governanceDispatch] = useReducer(governanceReducer, initialGovernanceState);
  // handles current viewing governance state
  const [treasury, treasuryDispatch] = useReducer(treasuryReducer, initialTreasuryState);
  // handles current connected account state
  const [account, accountDispatch] = useReducer(accountReducer, initialAccountState);
  // memoize fractal store
  const fractalStore: FractalStore = useMemo(() => {
    return {
      node,
      guard,
      governance,
      treasury,
      account,
      dispatch: {
        node: nodeDispatch,
        guard: guardDispatch,
        governance: governanceDispatch,
        treasury: treasuryDispatch,
        account: accountDispatch,
      },
      clients: {
        safeService,
      },
      baseContracts,
    };
  }, [node, guard, governance, treasury, account, safeService, baseContracts]);

  return <FractalContext.Provider value={fractalStore}></FractalContext.Provider>;
}
