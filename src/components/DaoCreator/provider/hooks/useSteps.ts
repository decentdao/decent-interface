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
    const isPureGnosis = state.governance === GovernanceTypes.GNOSIS_SAFE;

    // True when:
    // 1) The DAO being created is a subDAO,
    // @note setting this to false for now, this should be set to the isSubDAO prop
    const showFunding = false;

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
            nextStep: showFunding
              ? CreatorSteps.FUNDING
              : isPureGnosis
              ? CreatorSteps.PURE_GNOSIS
              : CreatorSteps.GNOSIS_WITH_USUL,
            prevStep: CreatorSteps.ESSENTIALS,
          },
        });
        break;
      case CreatorSteps.GNOSIS_WITH_USUL:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.GOV_CONFIG,
            prevStep: CreatorSteps.CHOOSE_GOVERNANCE,
          },
        });
        break;
      case CreatorSteps.PURE_GNOSIS:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: null,
            prevStep: CreatorSteps.CHOOSE_GOVERNANCE,
          },
        });
        break;
      case CreatorSteps.FUNDING:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: isPureGnosis ? CreatorSteps.PURE_GNOSIS : CreatorSteps.GNOSIS_WITH_USUL,
            prevStep: CreatorSteps.CHOOSE_GOVERNANCE,
          },
        });
        break;
      case CreatorSteps.GOV_CONFIG:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.GUARD_CONFIG,
            prevStep: CreatorSteps.GNOSIS_WITH_USUL,
          },
        });
        break;
      case CreatorSteps.GUARD_CONFIG:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            prevStep: CreatorSteps.GOV_CONFIG,
          },
        });
        break;
    }
  }, [isSubDAO, state.step, dispatch, state.governance]);
}
