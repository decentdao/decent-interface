import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import {
  AzoriusGovernance,
  DAO,
  Fractal,
  FractalActions,
  ReadOnlyState,
  StoreAction,
  StrategyType,
} from '../../types';
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

export const initialReadOnlyState: ReadOnlyState = {
  dao: null,
  user: {
    address: undefined,
    votingWeight: BigNumber.from(0),
  },
};

export const initialState = {
  node: initialNodeState,
  governance: initialGovernanceState,
  treasury: initialTreasuryState,
  governanceContracts: initialGovernanceContractsState,
  guardContracts: initialGuardContractsState,
  guard: initialGuardState,
  readOnly: initialReadOnlyState,
};

export const useCombinedReducer = () => {
  const { address: account } = useAccount();

  const readOnlyValues = useCallback(
    (state: Fractal) => {
      const { node, governance } = state;

      const isSigner = account && node.safe?.owners.includes(account);
      const tokenWeight =
        (governance as AzoriusGovernance).votesToken?.votingWeight || BigNumber.from(0);

      const votingWeight = () => {
        switch (governance.type) {
          case StrategyType.GNOSIS_SAFE:
            return isSigner ? BigNumber.from(1) : BigNumber.from(0);
          case StrategyType.GNOSIS_SAFE_USUL:
            return tokenWeight;
          default:
            return BigNumber.from(0);
        }
      };

      // if there is no DAO connected, return null for this
      const dao: DAO | null = !node.daoAddress
        ? null
        : {
            isAzorius: governance.type === StrategyType.GNOSIS_SAFE_USUL,
          };

      return {
        user: {
          address: account, // TODO normalize?
          votingWeight: votingWeight(),
        },
        dao: dao,
      } as ReadOnlyState;
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
        readOnly: readOnlyValues(state),
      };
    },
    [readOnlyValues]
  );

  return combinedReducer;
};
