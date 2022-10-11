import { useEffect } from 'react';
import { CreatorProviderActions, CreatorState, CreatorSteps, GovernanceTypes } from './../types';
import { useFractal } from '../../../../providers/fractal/hooks/useFractal';

/**
 * handles tracking/setting of next/prev steps dependent on the current page
 * @param state
 * @param dispatch
 * @param isSubDAO
 */
export function useSteps(state: CreatorState, dispatch: React.Dispatch<any>, isSubDAO?: boolean) {
  const {
    mvd: {
      modules: { gnosisWrapperModule },
    },
  } = useFractal();
  useEffect(() => {
    const isTokenGovernance = state.governance === GovernanceTypes.TOKEN_VOTING_GOVERNANCE;
    const isGnosisGovernance = state.governance === GovernanceTypes.MVD_GNOSIS;
    const isPureGnosis = state.governance === GovernanceTypes.GNOSIS_SAFE;

    // True when:
    // 1) The DAO being created is a subDAO,
    // 2) The DAO being created is a token voting DAO
    // 3) The parent DAO is not a Gnosis Safe DAO
    const showFunding = isSubDAO && isTokenGovernance && !gnosisWrapperModule;

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
            nextStep: isPureGnosis
              ? CreatorSteps.PURE_GNOSIS
              : isGnosisGovernance
              ? CreatorSteps.GNOSIS_GOVERNANCE
              : showFunding
              ? CreatorSteps.FUNDING
              : CreatorSteps.TREASURY_GOV_TOKEN,
            prevStep: CreatorSteps.ESSENTIALS,
          },
        });
        break;
      case CreatorSteps.PURE_GNOSIS:
        dispatch({
          type: CreatorProviderActions.UPDATE_STEP,
          payload: {
            nextStep: CreatorSteps.TREASURY_GOV_TOKEN,
            prevStep: CreatorSteps.CHOOSE_GOVERNANCE,
          },
        });
        break;
      case CreatorSteps.GNOSIS_GOVERNANCE:
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
            prevStep: isPureGnosis
              ? CreatorSteps.PURE_GNOSIS
              : isSubDAO
              ? CreatorSteps.FUNDING
              : CreatorSteps.CHOOSE_GOVERNANCE,
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
  }, [isSubDAO, state.step, dispatch, state.governance, gnosisWrapperModule]);
}
