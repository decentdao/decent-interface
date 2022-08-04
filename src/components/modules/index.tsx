import { useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useModuleType } from './hooks/useModuleType';
import { ModuleSelectAction, ModuleSelectActions, ModuleSelectState, ModuleTypes } from './types';

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
      return { ...action.payload, isLoading: false };
    case ModuleSelectActions.INVALID:
      return { ...initialState, isLoading: false };
    case ModuleSelectActions.RESET:
      return initialState;
    default:
      return state;
  }
};
export function Modules() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { dao } = useFractal();
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading, module } = useModuleType(state.moduleAddress);

  useEffect(() => {
    if (params.moduleAddress) {
      dispatch({ type: ModuleSelectActions.SET_MODULE_ADDRESS, payload: params.moduleAddress });
    }
  }, [params, dispatch]);

  useEffect(() => {
    if (module && !isLoading) {
      dispatch({
        type: ModuleSelectActions.SET_MODULE,
        payload: module,
      });
    }
    if (!isLoading && !module) {
      dispatch({
        type: ModuleSelectActions.INVALID,
      });
    }
  }, [module, isLoading]);

  useEffect(() => {
    if (!state.isLoading && !state.moduleType) {
      navigate(`/daos/${dao.daoAddress}`, { replace: true });
    }
  }, [state.isLoading, state.moduleType, dao.daoAddress, navigate]);

  switch (state.moduleType) {
    case ModuleTypes.TREASURY:
      return <div>Treasury</div>;
    case ModuleTypes.TOKEN_VOTING_GOVERNANCE:
      return <div>Governance</div>;
    default: {
      return null;
    }
  }
}
