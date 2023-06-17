import { FractalModuleData, FractalGuardContracts, FreezeGuard } from './fractal';
import { SafeInfoResponseWithGuard } from './safeGlobal';

export type DAOData = {
  safe: SafeInfoResponseWithGuard;
  fractalModules?: FractalModuleData[];
  freezeGuardContracts: FractalGuardContracts;
  freezeGuard: FreezeGuard;
};

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
}
