import { useEffect, useReducer } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Delegate from '../../components/Dao/Delegate';
import { Governance } from '../../pages/Governance';
import Proposals from '../../pages/Proposals';
import Treasury from '../../pages/Treasury';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisWrapperProvider } from '../../providers/gnosis/GnosisWrapperProvider';
import { GovernorModuleProvider } from '../../providers/govenor/GovenorModuleProvider';
import { TreasuryModuleProvider } from '../../providers/treasury/TreasuryModuleProvider';
import { ModuleSelectAction, ModuleSelectActions, ModuleSelectState, ModuleTypes } from './types';
import { GnosisRoutes } from '../../pages/GnosisWrapper/routes';

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
  const {
    mvd: { dao, modules },
  } = useFractal();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the address of the module currently navigated to
    const moduleAddress = params.moduleAddress;
    if (!moduleAddress || !state.isLoading) {
      return;
    }
    // on reload waits for modules to load
    if (Object.values(modules).every(v => !v)) {
      return;
    }

    const { treasuryModule, tokenVotingGovernanceModule, gnosisWrapperModule } = modules;
    switch (moduleAddress) {
      case treasuryModule?.moduleAddress: {
        dispatch({ type: ModuleSelectActions.SET_MODULE, payload: treasuryModule! });
        break;
      }
      case tokenVotingGovernanceModule?.moduleAddress: {
        dispatch({ type: ModuleSelectActions.SET_MODULE, payload: tokenVotingGovernanceModule! });
        break;
      }
      case gnosisWrapperModule?.moduleAddress: {
        dispatch({ type: ModuleSelectActions.SET_MODULE, payload: gnosisWrapperModule! });
        break;
      }
      default: {
        dispatch({ type: ModuleSelectActions.INVALID });
        break;
      }
    }
  }, [dao, params, dispatch, state.isLoading, modules]);

  useEffect(() => {
    if (params.moduleAddress !== state.moduleAddress && !state.isLoading) {
      dispatch({ type: ModuleSelectActions.RESET });
    }
  }, [params.moduleAddress, state.moduleAddress, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading && !state.moduleType) {
      navigate(`/daos/${dao.daoAddress}`, { replace: true });
    }
  }, [state.isLoading, state.moduleType, dao.daoAddress, navigate]);

  switch (state.moduleType) {
    case ModuleTypes.TREASURY:
      return (
        <TreasuryModuleProvider moduleAddress={state.moduleAddress}>
          <Treasury />
        </TreasuryModuleProvider>
      );
    case ModuleTypes.TOKEN_VOTING_GOVERNANCE:
      return (
        <GovernorModuleProvider
          moduleAddress={state.moduleAddress}
          timeLockModuleAddress={modules.timelockModule?.moduleAddress}
          claimingContractAddress={modules.claimingContractModule?.moduleAddress}
        >
          <Routes>
            <Route
              index
              element={<Governance />}
            />
            <Route
              path="proposals/*"
              element={<Proposals />}
            />
            <Route
              path="delegate"
              element={<Delegate />}
            />
          </Routes>
        </GovernorModuleProvider>
      );
    case ModuleTypes.GNOSIS_WRAPPER:
      return (
        <GnosisWrapperProvider moduleAddress={state.moduleAddress}>
          <GnosisRoutes />
        </GnosisWrapperProvider>
      );
    default: {
      return null;
    }
  }
}
