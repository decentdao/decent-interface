import { FractalModuleData, FractalGuardContracts, FreezeGuard } from './fractal';
import { SafeInfoResponseWithGuard } from './safeGlobal';

export type DAOData = {
  safe: SafeInfoResponseWithGuard;
  fractalModules?: FractalModuleData[];
  freezeGuardContracts: FractalGuardContracts;
  freezeGuard: FreezeGuard;
};

export type DAOMetadata = {
  address: string;
  logo: string;
  headerBackground: string;
  links: {
    title: string;
    url: string;
  }[];
  sections: {
    title: string;
    content: string;
    background?: string;
  }[];
};

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
}
