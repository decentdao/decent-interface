import { ReactNode, useMemo, useReducer } from 'react';
import {
  gnosisInitialState,
  governanceInitialState,
  treasuryInitialState,
  connectedAccountInitialState,
} from './constants';
import { useGnosisGovernance } from './governance/hooks/useGnosisGovernance';
import { governanceReducer, initializeGovernanceState } from './governance/reducer';
import { useAccount } from './hooks/account/useAccount';
import { useLocalStorage } from './hooks/account/useLocalStorage';
import useDAOName from './hooks/useDAOName';
import { FractalContext } from './hooks/useFractal';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { useGnosisModuleTypes } from './hooks/useGnosisModuleTypes';
import { useGnosisVeto } from './hooks/useGnosisVeto';
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
  useGnosisVeto(gnosisDispatch, gnosis.safe.guard, gnosis.modules);
  useGnosisGovernance({ governance, gnosis, governanceDispatch });
  useNodes({ gnosis, gnosisDispatch });

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
