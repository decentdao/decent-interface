import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { AzoriusGovernance, Fractal, FractalActions, StoreAction, StrategyType } from '../../types';
import { FractalGovernanceActions } from './governance/action';
import { governanceReducer, initialGovernanceState } from './governance/reducer';
import { GovernanceContractActions } from './governanceContracts/action';
import {
  governanceContractsReducer,
  initialGovernanceContractsState,
} from './governanceContracts/reducer';
import { FractalGuardActions } from './guard/action';
import { initialGuardState, guardReducer } from './guard/reducer';
import { GuardContractActions } from './guardContracts/action';
import { guardContractReducer, initialGuardContractsState } from './guardContracts/reducer';
import { NodeActions } from './node/action';
import { initialNodeState, nodeReducer } from './node/reducer';
import { TreasuryActions } from './treasury/action';
import { initialTreasuryState, treasuryReducer } from './treasury/reducer';

export const RESET_ALL = 'RESET_ALL';

export const initialState = {
  node: initialNodeState,
  governance: initialGovernanceState,
  treasury: initialTreasuryState,
  governanceContracts: initialGovernanceContractsState,
  guardContracts: initialGuardContractsState,
  guard: initialGuardState,
  // @todo This will need to be updated;
  readOnlyState: {} as any,
};

export const useCombinedReducer = () => {
  const { address: account } = useAccount();

  const readOnlyValues = useCallback(
    (state: Fractal) => {
      const { node, governance, treasury } = state;
      const isDAOConnected = !!node.daoAddress;
      const isGovernanceTypeSet = !!governance.type;
      const isAzorius = governance.type === StrategyType.GNOSIS_SAFE_USUL;
      const isAccountConnected = !!account;
      const azoriusGovernance = governance as AzoriusGovernance;

      // const isOwnerOrDelegate =

      return {};
    },
    [account]
  );

  const combinedReducer = useCallback(
    (state: Fractal, action: FractalActions) => {
      if (action.type === StoreAction.RESET) {
        return initialState;
      }

      return {
        node: nodeReducer(state.node, action as NodeActions),
        governance: governanceReducer(state.governance, action as FractalGovernanceActions),
        treasury: treasuryReducer(state.treasury, action as TreasuryActions),
        governanceContracts: governanceContractsReducer(
          state.governanceContracts,
          action as GovernanceContractActions
        ),
        guardContracts: guardContractReducer(state.guardContracts, action as GuardContractActions),
        guard: guardReducer(state.guard, action as FractalGuardActions),
        readOnlyState: readOnlyValues(state),
      };
    },
    [readOnlyValues]
  );

  return combinedReducer;
};
