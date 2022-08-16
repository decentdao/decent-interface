import { useEffect } from 'react';
import { CreatorProviderActions, CreatorState, CreatorSteps, GovernanceTypes } from './../types';

/**
 * handles tracking/setting of next/prev steps dependent on the current page
 * @param state
 * @param dispatch
 * @param isSubDAO
 */
export function useSteps(state: CreatorState, dispatch: React.Dispatch<any>, isSubDAO?: boolean) {
  useEffect(() => {
    const isTokenGovernance = state.governance === GovernanceTypes.TOKEN_VOTING_GOVERNANCE;
    const isGnosisGovernance = state.governance === GovernanceTypes.GNOSIS_SAFE;

    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.CHOOSE_GOVERNANCE,
            prevStep: null,
          },
        });
        break;
      case CreatorSteps.CHOOSE_GOVERNANCE:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: isGnosisGovernance
              ? CreatorSteps.GNOSIS_GOVERNANCE
              : isSubDAO && isTokenGovernance
              ? CreatorSteps.FUNDING
              : CreatorSteps.TREASURY_GOV_TOKEN,
            prevStep: CreatorSteps.ESSENTIALS,
          },
        });
        break;
      case CreatorSteps.GNOSIS_GOVERNANCE:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: null,
            prevStep: CreatorSteps.GNOSIS_GOVERNANCE,
          },
        });
        break;
      case CreatorSteps.FUNDING:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.TREASURY_GOV_TOKEN,
            prevStep: CreatorSteps.CHOOSE_GOVERNANCE,
          },
        });
        break;
      case CreatorSteps.TREASURY_GOV_TOKEN:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.GOV_CONFIG,
            prevStep: isSubDAO ? CreatorSteps.FUNDING : CreatorSteps.CHOOSE_GOVERNANCE,
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
  }, [isSubDAO, state.step, dispatch, state.governance]);
}
