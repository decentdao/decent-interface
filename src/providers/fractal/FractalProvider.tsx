import { ReactNode, useEffect, useMemo, useReducer } from 'react';

import {
  GovernanceAction,
  TreasuryAction,
  gnosisInitialState,
  governanceInitialState,
  treasuryInitialState,
  connectedAccountInitialState,
} from './constants';
import { useAccount } from './hooks/account/useAccount';
import { useLocalStorage } from './hooks/account/useLocalStorage';
import useDAOName from './hooks/useDAOName';
import { FractalContext } from './hooks/useFractal';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { useGnosisGovernance } from './hooks/useGnosisGovernance';
import { useGnosisModuleTypes } from './hooks/useGnosisModuleTypes';
import { gnosisReducer, initializeGnosisState } from './reducers';
import { connectedAccountReducer, initializeConnectedAccount } from './reducers/account';
import { governanceReducer, initializeGovernanceState } from './reducers/governance';
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
  useGnosisApiServices(gnosis.safe.address, treasuryDispatch);
  useGnosisModuleTypes(gnosisDispatch, gnosis.safe.modules);
  useGnosisGovernance(gnosis, governanceDispatch);
  useDAOName({ address: gnosis.safe.address, gnosisDispatch });
  useAccount({
    safeAddress: gnosis.safe.address,
    accountDispatch,
  });
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
