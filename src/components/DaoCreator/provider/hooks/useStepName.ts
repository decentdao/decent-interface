import { useEffect, useState } from 'react';
import { CREATOR_STEP_TITLES } from '../constants';
import { CreatorState, CreatorSteps } from '../types';

export function useStepName(state: CreatorState) {
  const [stepName, setStepName] = useState(CREATOR_STEP_TITLES[state.step]);

  useEffect(() => {
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        setStepName(CREATOR_STEP_TITLES[state.step]);
        break;
      case CreatorSteps.GOV_CONFIG:
      case CreatorSteps.TREASURY_GOV_TOKEN:
      case CreatorSteps.FUNDING: {
        const title = `${state.essentials!.daoName} ${CREATOR_STEP_TITLES[state.step]} `;
        setStepName(title);
        break;
      }
      default:
        setStepName(CREATOR_STEP_TITLES[state.step]);
        break;
    }
  }, [state.step, state.essentials]);

  return stepName;
}
