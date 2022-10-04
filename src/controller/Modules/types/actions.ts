import { ModuleSelectActions, ModuleTypes } from './enums';

export type ModuleSelectAction =
  | {
      type: ModuleSelectActions.SET_MODULE;
      payload: {
        moduleAddress: string;
        moduleType: ModuleTypes;
      };
    }
  | { type: ModuleSelectActions.SET_MODULE_ADDRESS; payload: string }
  | { type: ModuleSelectActions.RESET }
  | { type: ModuleSelectActions.INVALIDATE };
