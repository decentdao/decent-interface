'use client';

import { ReactNode, useReducer, useMemo, Context, createContext, useContext } from 'react';
import { useAccount } from 'wagmi';
import useSafeContracts from '../../hooks/safe/useSafeContracts';
import { FractalStore, StoreAction } from '../../types';
import { combinedReducer, initialState } from './combinedReducer';
import { useSafeService } from './hooks/useSafeService';
import { useReadOnlyValues } from './useReadOnlyValues';
export const FractalContext = createContext<FractalStore | null>(null);

export const useFractal = (): FractalStore => useContext(FractalContext as Context<FractalStore>);
export function AppProvider({ children }: { children: ReactNode }) {
  const { address: account } = useAccount();
  // Replace individual useReducer calls with a single combined reducer
  const [state, dispatch] = useReducer(combinedReducer, initialState);
  // loads base Fractal contracts with provider into state
  const baseContracts = useSafeContracts();
  // loads safe service into state;
  const safeService = useSafeService();
  // memoize fractal store
  const { readOnlyValues } = useReadOnlyValues(state, account);
  const fractalStore: FractalStore = useMemo(() => {
    return {
      node: state.node,
      guard: state.guard,
      governance: state.governance,
      treasury: state.treasury,
      governanceContracts: state.governanceContracts,
      guardContracts: state.guardContracts,
      readOnly: readOnlyValues,
      action: {
        dispatch,
        resetDAO: async () => {
          await Promise.resolve(dispatch({ type: StoreAction.RESET }));
        },
      },
      clients: {
        safeService,
      },
      baseContracts,
    };
  }, [state, safeService, baseContracts, readOnlyValues]);

  return <FractalContext.Provider value={fractalStore}>{children}</FractalContext.Provider>;
}
