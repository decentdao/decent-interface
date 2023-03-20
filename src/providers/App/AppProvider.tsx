import { Context, createContext, useContext, useMemo, useReducer } from 'react';
import { FractalStore } from '../../types';
import { initialNodeState, nodeReducer } from './node/reducer';

export const FractalContext = createContext<FractalStore | null>(null);

export const useFractal = (): FractalStore => useContext(FractalContext as Context<FractalStore>);

export function AppProvider() {
  // handles current viewing node (DAO) state
  const [node, nodeDispatch] = useReducer(nodeReducer, initialNodeState);

  const fractalStore: FractalStore = useMemo(() => {
    return {
      node,
      dispatch: {
        node: nodeDispatch,
      },
    };
  }, [node]);

  return <FractalContext.Provider value={fractalStore}></FractalContext.Provider>;
}
