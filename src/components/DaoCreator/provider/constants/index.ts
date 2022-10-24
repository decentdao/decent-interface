import { CreatorSteps } from '../types';

export const CREATOR_STEP_TITLE_KEYS = {
  [CreatorSteps.ESSENTIALS]: 'titleEssentials',
  [CreatorSteps.CHOOSE_GOVERNANCE]: 'titleChooseGovernance',
  [CreatorSteps.PURE_GNOSIS]: 'titlePureGnosis',
  [CreatorSteps.GNOSIS_WITH_USUL]: 'titleGnosisUsul',
  [CreatorSteps.GNOSIS_GOVERNANCE]: 'titleGnosis',
  [CreatorSteps.TREASURY_GOV_TOKEN]: 'titleGovToken',
  [CreatorSteps.GOV_CONFIG]: 'titleGovConfig',
  [CreatorSteps.FUNDING]: 'titleFunding',
};

export const DEFAULT_TOKEN_DECIMALS = 18;
