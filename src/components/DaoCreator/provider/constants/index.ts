import { CreatorSteps } from '../types';

export const CREATOR_STEP_TITLES = {
  [CreatorSteps.ESSENTIALS]: 'Configure Essentials',
  [CreatorSteps.CHOOSE_GOVERNANCE]: 'Choose Governance',
  [CreatorSteps.PURE_GNOSIS]: 'Pure Gnosis Safe Configuration',
  [CreatorSteps.GNOSIS_GOVERNANCE]: 'Gnosis Configuration',
  [CreatorSteps.TREASURY_GOV_TOKEN]: 'Treasury and Governance Token',
  [CreatorSteps.GOV_CONFIG]: 'Governance Configuration',
  [CreatorSteps.FUNDING]: 'Funding',
};

export const DEFAULT_TOKEN_DECIMALS = 18;
