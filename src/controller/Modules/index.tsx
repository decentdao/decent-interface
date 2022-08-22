import { useEffect, useReducer } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Delegate from '../../components/Dao/Delegate';
import { Governance } from '../../pages/Governance';
import Proposals from '../../pages/Proposals';
import Treasury from '../../pages/Treasury';
import { GnosisWrapper } from '../../pages/GnosisWrapper';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisWrapperProvider } from '../../providers/gnosis/GnosisWrapperProvider';
import { GovernorModuleProvider } from '../../providers/govenor/GovenorModuleProvider';
import { TreasuryModuleProvider } from '../../providers/treasury/TreasuryModuleProvider';
import {
  IModuleData,
  ModuleSelectAction,
  ModuleSelectActions,
  ModuleSelectState,
  ModuleTypes,
} from './types';

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
    dao,
    modules: {
      treasuryModule,
      tokenVotingGovernanceModule,
      claimingContractModule,
      timelockModule,
      gnosisWrapperModule,
    },
  } = useFractal();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the address of the module currently navigated to
    const moduleAddress = params.moduleAddress;
    if (
      moduleAddress &&
      state.isLoading &&
      (treasuryModule || tokenVotingGovernanceModule || gnosisWrapperModule)
    ) {
      const isTreasuryModule = treasuryModule
        ? treasuryModule.moduleAddress === moduleAddress
        : undefined;
      const isTokenVotingGovernanceModule = tokenVotingGovernanceModule
        ? tokenVotingGovernanceModule.moduleAddress === moduleAddress
        : undefined;
      const isGnosisWrapperModule = gnosisWrapperModule
        ? gnosisWrapperModule.moduleAddress === moduleAddress
        : undefined;

      let moduleData: IModuleData | undefined;
      if (isTreasuryModule) {
        moduleData = treasuryModule;
      }
      if (isTokenVotingGovernanceModule) {
        moduleData = tokenVotingGovernanceModule;
      }
      if (isGnosisWrapperModule) {
        moduleData = gnosisWrapperModule;
      }
      if (moduleData) {
        dispatch({ type: ModuleSelectActions.SET_MODULE, payload: moduleData });
      } else {
        dispatch({ type: ModuleSelectActions.INVALID });
      }
    }
  }, [
    params,
    dispatch,
    state.isLoading,
    treasuryModule,
    tokenVotingGovernanceModule,
    gnosisWrapperModule,
    dao.moduleAddresses,
  ]);

  useEffect(() => {
    if (params.moduleAddress !== state.moduleAddress && !state.isLoading) {
      dispatch({ type: ModuleSelectActions.RESET });
    }
  }, [params.moduleAddress, state.moduleAddress, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading && !state.moduleType && dao.isLoading) {
      navigate(`/daos/${dao.daoAddress}`, { replace: true });
    }
  }, [state.isLoading, state.moduleType, dao.daoAddress, navigate, dao.isLoading]);

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
          timeLockModuleAddress={timelockModule?.moduleAddress}
          claimingContractAddress={claimingContractModule?.moduleAddress}
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
          <GnosisWrapper />
        </GnosisWrapperProvider>
      );
    default: {
      return null;
    }
  }
}
