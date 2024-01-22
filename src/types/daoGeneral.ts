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
  bodyBackground?: string;
  links: {
    title: string;
    url: string;
  }[];
  sections: {
    title: string;
    content: string;
    background?: string;
    link?: {
      url: string;
      text: string;
      position: 'start' | 'end';
    };
  }[];
};

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
}
