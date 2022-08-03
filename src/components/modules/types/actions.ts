import { ModuleSelectActions } from './enums';

export type ModuleSelectAction =
  | {
      type: ModuleSelectActions.SET_MODULE;
      payload: {
        moduleAddress: string;
        moduleType: string;
      };
    }
  | { type: ModuleSelectActions.SET_MODULE_ADDRESS; payload: string }
  | { type: ModuleSelectActions.RESET };
