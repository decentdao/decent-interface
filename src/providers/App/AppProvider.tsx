import { Context, createContext, useContext, useMemo, useReducer } from 'react';
import useSafeContracts from '../../hooks/safe/useSafeContracts';
import { FractalStore } from '../../types';
import { accountReducer, initialAccountState } from './account/reducer';
import { governanceReducer, initialGovernanceState } from './governance/reducer';
import {
  governanceContractsReducer,
  initialGovernanceContractsState,
} from './governanceContracts/reducer';
import { guardReducer, initialGuardState } from './guard/reducer';
import { guardContractReducer, initialGuardContractsState } from './guardContracts/reducer';
import { useSafeService } from './hooks/useSafeService';
import { initialNodeState, nodeReducer } from './node/reducer';
import { initialNodeHierarchyState, nodeHierarchyReducer } from './nodeHierarchy/reducer';
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
  // handles current node's guard state
  const [guard, guardDispatch] = useReducer(guardReducer, initialGuardState);
  // handles current node's governance state
  const [governance, governanceDispatch] = useReducer(governanceReducer, initialGovernanceState);
  // handles current node's treasury state
  const [treasury, treasuryDispatch] = useReducer(treasuryReducer, initialTreasuryState);
  // handles current connected account state
  const [account, accountDispatch] = useReducer(accountReducer, initialAccountState);
  // handles current node's governance contracts state
  const [governanceContracts, governanceContractsDispatch] = useReducer(
    governanceContractsReducer,
    initialGovernanceContractsState
  );
  // handles current node's guard contracts state
  const [guardContracts, guardContractsDispatch] = useReducer(
    guardContractReducer,
    initialGuardContractsState
  );
  // handles current nodes's hiearchy state
  const [nodeHierarchy, nodeHierarchyDispatch] = useReducer(
    nodeHierarchyReducer,
    initialNodeHierarchyState
  );
  // memoize fractal store
  const fractalStore: FractalStore = useMemo(() => {
    return {
      node,
      guard,
      governance,
      treasury,
      account,
      governanceContracts,
      guardContracts,
      nodeHierarchy,
      dispatch: {
        node: nodeDispatch,
        guard: guardDispatch,
        governance: governanceDispatch,
        treasury: treasuryDispatch,
        account: accountDispatch,
        governanceContracts: governanceContractsDispatch,
        guardContracts: guardContractsDispatch,
        nodeHierarchy: nodeHierarchyDispatch,
      },
      clients: {
        safeService,
      },
      baseContracts,
    };
  }, [
    node,
    guard,
    governance,
    treasury,
    account,
    guardContracts,
    governanceContracts,
    nodeHierarchy,
    safeService,
    baseContracts,
  ]);

  return <FractalContext.Provider value={fractalStore}></FractalContext.Provider>;
}
