import { useEffect } from 'react';
import { CreatorProviderActions, CreatorState, CreatorSteps } from './../types';

/**
 * handles tracking/setting of next/prev steps dependent on the current page
 * @param state
 * @param dispatch
 * @param isSubDAO
 */
export function useSteps(state: CreatorState, dispatch: React.Dispatch<any>, isSubDAO?: boolean) {
  useEffect(() => {
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: isSubDAO ? CreatorSteps.FUNDING : CreatorSteps.TREASURY_GOV_TOKEN,
            prevStep: null,
          },
        });
        break;
      case CreatorSteps.FUNDING:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.TREASURY_GOV_TOKEN,
            prevStep: CreatorSteps.ESSENTIALS,
          },
        });
        break;
      case CreatorSteps.TREASURY_GOV_TOKEN:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.GOV_CONFIG,
            prevStep: isSubDAO ? CreatorSteps.FUNDING : CreatorSteps.ESSENTIALS,
          },
        });
        break;
      case CreatorSteps.GOV_CONFIG:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            prevStep: CreatorSteps.TREASURY_GOV_TOKEN,
          },
        });
        break;
    }
  }, [isSubDAO, state.step, dispatch]);
}
