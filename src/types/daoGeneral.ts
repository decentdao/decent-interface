import { SafeInfoResponse } from '@safe-global/api-kit';
import { FractalModuleData, FractalGuardContracts, FreezeGuard } from './fractal';

export type DAOData = {
  safe: SafeInfoResponse;
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
