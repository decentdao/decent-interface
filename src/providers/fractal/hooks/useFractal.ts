import { createContext, useContext, Context } from 'react';

export const FractalContext = createContext<any>(null);

export const useFractal = (): any => useContext({} as Context<any>);
