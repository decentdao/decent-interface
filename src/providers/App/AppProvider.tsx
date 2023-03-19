import { Context, createContext, useContext, useReducer } from 'react';
import { Fractal } from '../../types';
import { initialNodeState, nodeReducer } from './node/reducer';

export const FractalContext = createContext<Fractal | null>(null);

export const useFractal = (): Fractal => useContext(FractalContext as Context<Fractal>);

export function AppProvider() {
  // @todo this file will setup reducers states and handle dispatching actions to the reducers.

  // node state
  const [node, nodeDispatch] = useReducer(nodeReducer, initialNodeState);

  return <FractalContext.Provider value={{} as Fractal}></FractalContext.Provider>;
}
