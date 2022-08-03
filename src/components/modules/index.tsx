import { useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { useModuleTypes } from './hooks/useModuleTypes';
import { ModuleSelectAction, ModuleSelectActions, ModuleSelectState } from './types';

const initialState = {
  moduleType: null,
  moduleAddress: null,
  isLoading: true,
};

const reducer = (state: ModuleSelectState, action: ModuleSelectAction) => {
  switch (action.type) {
    case ModuleSelectActions.SET_MODULE_ADDRESS:
      return { ...state, moduleAddress: action.payload };
    case ModuleSelectActions.SET_MODULE:
      return { isLoading: false, ...action.payload };
    case ModuleSelectActions.RESET:
      return initialState;
    default:
      return state;
  }
};
export function Modules() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const params = useParams();

  const module = useModuleTypes(state.moduleAddress);

  useEffect(() => {
    if (params.moduleAddress) {
      dispatch({ type: ModuleSelectActions.SET_MODULE_ADDRESS, payload: params.moduleAddress });
    }
  }, [params]);
  useEffect(() => {
    if (module) {
      dispatch({
        type: ModuleSelectActions.SET_MODULE,
        payload: module,
      });
    }
  }, [module]);
  switch (state.moduleType) {
    case 'Treasury':
      return <div>Treasury</div>;
    case 'VotingTokenGovernance':
      return <div>Governance</div>;
    default:
      return null;
  }
}
