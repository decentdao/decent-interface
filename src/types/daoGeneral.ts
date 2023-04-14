import { FractalModuleData, FractalGuardContracts, FreezeGuard } from './fractal';
import { SafeInfoResponseWithGuard } from './safeGlobal';

export type SubDAOData = {
  safe: SafeInfoResponseWithGuard;
  fractalModules?: FractalModuleData[];
  vetoGuardContracts: FractalGuardContracts;
  freezeGuard: FreezeGuard;
};

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
}
