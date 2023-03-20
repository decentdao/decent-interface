import { Context, createContext, useContext, useMemo, useReducer } from 'react';
import useSafeContracts from '../../hooks/safe/useSafeContracts';
import { FractalStore } from '../../types';
import { useSafeService } from './hooks/useSafeService';
import { initialNodeState, nodeReducer } from './node/reducer';

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

  // memoize fractal store
  const fractalStore: FractalStore = useMemo(() => {
    return {
      node,
      dispatch: {
        node: nodeDispatch,
      },
      clients: {
        safeService,
      },
      baseContracts,
    };
  }, [node, safeService, baseContracts]);

  return <FractalContext.Provider value={fractalStore}></FractalContext.Provider>;
}
