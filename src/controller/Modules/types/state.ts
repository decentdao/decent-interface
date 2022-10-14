import { ModuleTypes } from './enums';

export interface ModuleSelectState {
  isLoading: boolean;
  moduleType: string | null;
  moduleAddress: string | null;
}

export interface IModuleData {
  moduleAddress: string;
  moduleType: ModuleTypes;
}
