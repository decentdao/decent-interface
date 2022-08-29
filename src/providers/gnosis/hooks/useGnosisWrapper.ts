import { createContext, useContext, Context } from 'react';
import { GnosisWrapper } from '../../../assets/typechain-types/gnosis-wrapper';

export interface IGnosisWrapperContext {
  gnosisWrapperContract: GnosisWrapper | undefined;
  gnosisSafeAddress: string | undefined;
}

export const GnosisWrapperContext = createContext<IGnosisWrapperContext | null>(null);

export const useGnosisWrapper = (): IGnosisWrapperContext =>
  useContext(GnosisWrapperContext as Context<IGnosisWrapperContext>);
