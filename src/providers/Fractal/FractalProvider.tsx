import { ReactNode, useEffect, useMemo, useReducer } from 'react';

import {
  TreasuryAction,
  gnosisInitialState,
  governanceInitialState,
  treasuryInitialState,
  connectedAccountInitialState,
  GnosisAction,
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
  const { getGnosisSafeTransactions } = useGnosisApiServices(
    gnosis,
    treasuryDispatch,
    gnosisDispatch
  );
  useGnosisModuleTypes(gnosisDispatch, gnosis.safe.modules);
  useDAOName({ address: gnosis.safe.address, gnosisDispatch });
  useAccount({
    safeAddress: gnosis.safe.address,
    accountDispatch,
  });
  useGnosisGovernance({ governance, gnosis, governanceDispatch });

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
        getGnosisSafeTransactions,
      },
    }),
    [gnosis, governance, treasury, account, getGnosisSafeTransactions]
  );

  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
