import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CREATOR_STEP_TITLE_KEYS } from '../constants';
import { CreatorState, CreatorSteps } from '../types';

/**
 * handles form page title
 * @param state
 * @returns
 */
export function useStepName(state: CreatorState) {
  const { t } = useTranslation('daoCreate');
  const [stepName, setStepName] = useState<string[]>(t(CREATOR_STEP_TITLE_KEYS[state.step]));

  useEffect(() => {
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        setStepName(t(CREATOR_STEP_TITLE_KEYS[state.step]));
        break;
      case CreatorSteps.GOV_CONFIG:
      case CreatorSteps.FUNDING: {
        setStepName(
          t('stepName', {
            daoName: state.essentials!.daoName,
            stepName: t(CREATOR_STEP_TITLE_KEYS[state.step]),
          })
        );
        break;
      }
      default:
        setStepName(t(CREATOR_STEP_TITLE_KEYS[state.step]));
        break;
    }
  }, [state.step, state.essentials, t]);

  return stepName;
}
