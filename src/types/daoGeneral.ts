import { IGnosisVetoContract } from './daoGuard';
import { IGnosisModuleData, IGnosisFreezeGuard } from './fractal';
import { SafeInfoResponseWithGuard } from './safeGlobal';

export type SubDAOData = {
  safeInfo: SafeInfoResponseWithGuard;
  modules: IGnosisModuleData[] | undefined;
  vetoGuardContracts: IGnosisVetoContract;
  freezeGuard: IGnosisFreezeGuard | undefined;
};

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
}
