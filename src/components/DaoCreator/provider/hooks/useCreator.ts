import { createContext, useContext } from 'react';
import { ICreatorContext } from '../types';

export const CreatorContext = createContext<ICreatorContext | null>(null);
export const useCreator = (): ICreatorContext =>
  useContext(CreatorContext as React.Context<ICreatorContext>);
