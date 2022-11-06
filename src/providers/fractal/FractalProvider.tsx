import { ReactNode, useEffect, useMemo, useReducer } from 'react';

import {
  GovernanceAction,
  TreasuryAction,
  gnosisInitialState,
  governanceInitialState,
  treasuryInitialState,
} from './constants';
import useDAOName from './hooks/useDAOName';
import { FractalContext } from './hooks/useFractal';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { useGnosisGovernance } from './hooks/useGnosisGovernance';
import { useGnosisModuleTypes } from './hooks/useGnosisModuleTypes';
import { gnosisReducer, initializeGnosisState } from './reducers';
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

  // @todo update to handle new contracts
  // const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  useGnosisApiServices(gnosis.safe.address, treasuryDispatch);
  useGnosisModuleTypes(gnosisDispatch, gnosis.safe.modules);
  useGnosisGovernance(gnosis.safe, governanceDispatch);
  useDAOName({ address: gnosis.safe.address, gnosisDispatch });

  useEffect(() => {
    if (!gnosis.safe.address && !gnosis.isGnosisLoading) {
      governanceDispatch({ type: GovernanceAction.RESET });
      treasuryDispatch({ type: TreasuryAction.RESET });
    }
  }, [governanceDispatch, treasuryDispatch, gnosis.safe.address, gnosis.isGnosisLoading]);

  const value = useMemo(
    () => ({
      gnosis: gnosis,
      treasury: treasury,
      governance: governance,
      dispatches: {
        governanceDispatch,
        treasuryDispatch,
        gnosisDispatch,
      },
    }),
    [gnosis, governance, treasury]
  );

  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
