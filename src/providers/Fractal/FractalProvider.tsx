import { ReactNode, useEffect, useMemo, useReducer } from 'react';
import { useMatch } from 'react-router-dom';
import { DAO_ROUTES } from '../../routes/constants';
import {
  gnosisInitialState,
  governanceInitialState,
  treasuryInitialState,
  connectedAccountInitialState,
  GnosisAction,
  TreasuryAction,
} from './constants';
import { GovernanceAction } from './governance/actions';
import { useGnosisGovernance } from './governance/hooks/useGnosisGovernance';
import { governanceReducer, initializeGovernanceState } from './governance/reducer';
import { useAccount } from './hooks/account/useAccount';
import { useLocalStorage } from './hooks/account/useLocalStorage';
import useDispatchDAOName from './hooks/useDispatchDAOName';
import { FractalContext } from './hooks/useFractal';
import { useFreezeData } from './hooks/useFreezeData';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { useGnosisModuleTypes } from './hooks/useGnosisModuleTypes';
import useNodes from './hooks/useNodes';
import { useVetoContracts } from './hooks/useVetoContracts';
import { gnosisReducer, initializeGnosisState } from './reducers';
import { connectedAccountReducer, initializeConnectedAccount } from './reducers/account';
import { TreasuryReducer, initializeTreasuryState } from './reducers/treasury';
/**
 * Uses Context API to provider DAO information to app
 */
export function FractalProvider({ children }: { children: ReactNode }) {
  const [gnosis, gnosisDispatch] = useReducer(
    gnosisReducer,
    gnosisInitialState,
    initializeGnosisState
  );

  const [treasury, treasuryDispatch] = useReducer(
    TreasuryReducer,
    treasuryInitialState,
    initializeTreasuryState
  );

  const [governance, governanceDispatch] = useReducer(
    governanceReducer,
    governanceInitialState,
    initializeGovernanceState
  );

  const [account, accountDispatch] = useReducer(
    connectedAccountReducer,
    connectedAccountInitialState,
    initializeConnectedAccount
  );

  useLocalStorage();

  const { getGnosisSafeTransactions, getGnosisSafeInfo } = useGnosisApiServices(
    gnosis,
    treasuryDispatch,
    gnosisDispatch
  );

  const { lookupModules } = useGnosisModuleTypes(gnosisDispatch, gnosis.safe.modules);

  useDispatchDAOName({ address: gnosis.safe.address, gnosisDispatch });
  useAccount({
    safeAddress: gnosis.safe.address,
    accountDispatch,
  });
  const { getVetoGuardContracts } = useVetoContracts(
    gnosisDispatch,
    gnosis.safe.guard,
    gnosis.modules
  );

  useGnosisGovernance({ governance, gnosis, governanceDispatch });
  useNodes({ gnosis, gnosisDispatch });
  const { lookupFreezeData } = useFreezeData(gnosis.guardContracts, gnosisDispatch);

  const isViewingDAO = useMatch(DAO_ROUTES.daos.path);
  useEffect(() => {
    // Resets Fractal state when not viewing DAO
    if (!isViewingDAO) {
      gnosisDispatch({ type: GnosisAction.RESET });
      treasuryDispatch({ type: TreasuryAction.RESET });
      governanceDispatch({ type: GovernanceAction.RESET });
    }
  }, [gnosisDispatch, treasuryDispatch, governanceDispatch, isViewingDAO]);

  const value = useMemo(
    () => ({
      gnosis,
      treasury,
      governance,
      account,
      dispatches: {
        governanceDispatch,
        treasuryDispatch,
        gnosisDispatch,
      },
      actions: {
        refreshSafeData: async () => {
          await getGnosisSafeTransactions();
          await getGnosisSafeInfo();
        },
        lookupModules,
        getVetoGuardContracts,
        lookupFreezeData,
      },
    }),
    [
      gnosis,
      governance,
      treasury,
      account,
      getGnosisSafeTransactions,
      getGnosisSafeInfo,
      lookupModules,
      getVetoGuardContracts,
      lookupFreezeData,
    ]
  );

  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
