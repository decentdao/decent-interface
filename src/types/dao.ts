import {
  SafeInfoResponseWithGuard,
  IGnosisModuleData,
  IGnosisVetoContract,
  IGnosisFreezeData,
} from '../providers/Fractal/types';

export type SubDAOData = {
  safeInfo: SafeInfoResponseWithGuard;
  modules: IGnosisModuleData[] | undefined;
  vetoGuardContracts: IGnosisVetoContract;
  freezeData: IGnosisFreezeData | undefined;
};
