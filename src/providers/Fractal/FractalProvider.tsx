import { ReactNode, useEffect, useMemo, useReducer } from 'react';
import {
  TreasuryAction,
  gnosisInitialState,
  governanceInitialState,
  treasuryInitialState,
  connectedAccountInitialState,
} from './constants';
import { GovernanceAction } from './governance/actions';
import { useGnosisGovernance } from './governance/hooks/useGnosisGovernance';
import { governanceReducer, initializeGovernanceState } from './governance/reducer';
import { useAccount } from './hooks/account/useAccount';
import { useLocalStorage } from './hooks/account/useLocalStorage';
import useDAOName from './hooks/useDAOName';
import { FractalContext } from './hooks/useFractal';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { useGnosisModuleTypes } from './hooks/useGnosisModuleTypes';
import useNodes from './hooks/useNodes';
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

  // @todo update to handle new contracts
  // const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  useLocalStorage();
  useGnosisApiServices(gnosis, treasuryDispatch, gnosisDispatch);
  useGnosisModuleTypes(gnosisDispatch, gnosis.safe.modules);
  useDAOName({ address: gnosis.safe.address, gnosisDispatch });
  useAccount({
    safeAddress: gnosis.safe.address,
    accountDispatch,
  });
  useGnosisGovernance({ governance, gnosis, governanceDispatch });
  useNodes({ gnosis, gnosisDispatch });

  useEffect(() => {
    if (!gnosis.safe.address && !gnosis.isGnosisLoading) {
      governanceDispatch({ type: GovernanceAction.RESET });
      treasuryDispatch({ type: TreasuryAction.RESET });
    }
  }, [governanceDispatch, treasuryDispatch, gnosis.safe.address, gnosis.isGnosisLoading]);

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
    }),
    [gnosis, governance, treasury, account]
  );

  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
