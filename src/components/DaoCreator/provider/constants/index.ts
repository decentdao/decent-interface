import { CreatorSteps } from '../types';

export const CREATOR_STEP_TITLE_KEYS = {
  [CreatorSteps.ESSENTIALS]: 'titleEssentials',
  [CreatorSteps.CHOOSE_GOVERNANCE]: 'titleChooseGovernance',
  [CreatorSteps.PURE_GNOSIS]: 'titleSafeConfig',
  [CreatorSteps.GNOSIS_WITH_USUL]: 'titleUsulConfig',
  [CreatorSteps.GNOSIS_GOVERNANCE]: 'titleGnosis',
  [CreatorSteps.GOV_CONFIG]: 'titleGovConfig',
  [CreatorSteps.GUARD_CONFIG]: 'titleGuardConfig',
  [CreatorSteps.FUNDING]: 'titleFunding',
};

export const DEFAULT_TOKEN_DECIMALS = 18;
