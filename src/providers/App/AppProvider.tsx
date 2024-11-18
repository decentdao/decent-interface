import { Context, createContext, ReactNode, useContext, useMemo, useReducer } from 'react';
import { useAccount } from 'wagmi';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { FractalStore, StoreAction } from '../../types';
import { combinedReducer, initialState } from './combinedReducer';
import { useReadOnlyValues } from './useReadOnlyValues';
export const FractalContext = createContext<FractalStore | null>(null);

export const useFractal = (): FractalStore => useContext(FractalContext as Context<FractalStore>);
export function AppProvider({ children }: { children: ReactNode }) {
  const { address: account } = useAccount();
  // Replace individual useReducer calls with a single combined reducer
  const [state, dispatch] = useReducer(combinedReducer, initialState);
  // memoize fractal store
  const nodeStore = useDaoInfoStore();

  const { readOnlyValues, loadReadOnlyValues } = useReadOnlyValues(
    { node: nodeStore, governance: state.governance },
    account,
  );

  const fractalStore = useMemo(() => {
    return {
      node: nodeStore,
      guard: state.guard,
      governance: state.governance,
      treasury: state.treasury,
      governanceContracts: state.governanceContracts,
      guardContracts: state.guardContracts,
      readOnly: readOnlyValues,
      action: {
        dispatch,
        loadReadOnlyValues,
        resetSafeState: async () => {
          nodeStore.resetDaoInfoStore();
          await Promise.resolve(dispatch({ type: StoreAction.RESET }));
        },
      },
    };
  }, [
    nodeStore,
    state.guard,
    state.governance,
    state.treasury,
    state.governanceContracts,
    state.guardContracts,
    readOnlyValues,
    loadReadOnlyValues,
  ]);

  return <FractalContext.Provider value={fractalStore}>{children}</FractalContext.Provider>;
}
