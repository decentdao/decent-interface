import { IGnosisVetoContract } from './daoGuard';
import { IGnosisModuleData, IGnosisFreezeData } from './fractal';
import { SafeInfoResponseWithGuard } from './safeGlobal';

export type SubDAOData = {
  safeInfo: SafeInfoResponseWithGuard;
  modules: IGnosisModuleData[] | undefined;
  vetoGuardContracts: IGnosisVetoContract;
  freezeData: IGnosisFreezeData | undefined;
};

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
}
