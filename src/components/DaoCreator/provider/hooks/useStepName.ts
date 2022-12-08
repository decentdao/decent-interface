import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CREATOR_STEP_TITLE_KEYS } from '../constants';
import { CreatorState } from '../types';

/**
 * handles form page title
 * @param state
 * @returns
 */
export function useStepName(state: CreatorState) {
  const { t } = useTranslation('daoCreate');
  const [stepName, setStepName] = useState<string[]>(t(CREATOR_STEP_TITLE_KEYS[state.step]));

  useEffect(() => {
    setStepName(t(CREATOR_STEP_TITLE_KEYS[state.step]));
  }, [state.step, state.essentials, t]);

  return stepName;
}
