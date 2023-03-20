import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useReducer } from 'react';
import { DAO_ROUTES } from '../../routes/constants';
import { GnosisAction, TreasuryAction, GovernanceAction } from '../../types';
import { useNetworkConfg } from '../NetworkConfig/NetworkConfigProvider';
import {
  gnosisInitialState,
  treasuryInitialState,
  governanceInitialState,
  connectedAccountInitialState,
} from './constants';

import { useGnosisGovernance } from './governance/hooks/useGnosisGovernance';
import { governanceReducer, initializeGovernanceState } from './governance/reducer';
import { useAccount } from './hooks/account/useAccount';
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
  const { chainId } = useNetworkConfg();
  const { asPath } = useRouter();

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

  const { getGnosisSafeTransactions, getGnosisSafeInfo } = useGnosisApiServices(
    gnosis,
    treasuryDispatch,
    gnosisDispatch
  );

  const { lookupModules } = useGnosisModuleTypes(chainId, gnosis.safe.modules, gnosisDispatch);

  useDispatchDAOName({ address: gnosis.safe.address, gnosisDispatch });
  useAccount({
    safeAddress: gnosis.safe.address,
    accountDispatch,
  });

  const { getVetoGuardContracts } = useVetoContracts(
    gnosisDispatch,
    chainId,
    gnosis.safe.guard,
    gnosis.modules
  );

  useGnosisGovernance({ governance, gnosis, governanceDispatch, chainId });
  useNodes({ gnosis, gnosisDispatch, chainId });
  const { lookupFreezeData } = useFreezeData(gnosis.guardContracts, gnosisDispatch);

  const isViewingDAO = asPath === DAO_ROUTES.daos.path;
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
