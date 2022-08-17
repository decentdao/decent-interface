import { ReactNode, useMemo, useReducer } from 'react';
import ConnectWalletToast from '../../ConnectWalletToast';
import H1 from '../../ui/H1';
import { StepButtons } from '../StepButtons';

import { CreatorContext } from './hooks/useCreator';
import { useStepName } from './hooks/useStepName';
import { useSteps } from './hooks/useSteps';
import {
  CreatorProviderActions,
  CreatorProviderActionTypes,
  CreatorState,
  CreatorSteps,
  DAOTrigger,
  GovernanceTypes,
} from './types';

export const initialState: CreatorState = {
  step: CreatorSteps.ESSENTIALS,
  prevStep: null,
  nextStep: null,
  governance: GovernanceTypes.TOKEN_VOTING_GOVERNANCE,
  essentials: {
    daoName: '',
  },
  govToken: {
    tokenName: '',
    tokenSupply: '',
    tokenSymbol: '',
    tokenAllocations: [{ address: '', amount: 0 }],
    parentAllocationAmount: undefined,
  },
  govModule: {
    proposalThreshold: '0',
    quorum: '4',
    executionDelay: '6545',
    lateQuorumExecution: '0',
    voteStartDelay: '6545',
    votingPeriod: '45818',
  },
  funding: {
    tokensToFund: [],
    nftsToFund: [],
  },
  gnosis: {
    trustedAddresses: [{ address: '', error: false }],
    signatureThreshold: '',
  },
};

const reducer = (state: CreatorState, action: CreatorProviderActionTypes) => {
  switch (action.type) {
    case CreatorProviderActions.UPDATE_ESSENTIALS:
      return { ...state, essentials: { ...state.essentials, ...action.payload } };
    case CreatorProviderActions.UPDATE_GOVERNANCE:
      return { ...state, governance: action.payload };
    case CreatorProviderActions.UPDATE_FUNDING:
      return { ...state, funding: { ...state.funding, ...action.payload } };
    case CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN:
      return { ...state, govToken: { ...state.govToken, ...action.payload } };
    case CreatorProviderActions.UPDATE_GOV_CONFIG:
      return { ...state, govModule: { ...state.govModule, ...action.payload } };
    case CreatorProviderActions.UPDATE_GNOSIS_CONFIG: {
      return { ...state, gnosis: { ...state.gnosis, ...action.payload } };
    }
    case CreatorProviderActions.UPDATE_STEP:
      return { ...state, nextStep: action.payload.nextStep, prevStep: action.payload.prevStep };
    case CreatorProviderActions.SET_STEP:
      return { ...state, step: action.payload };
    case CreatorProviderActions.RESET:
      return { ...initialState };
    default:
      return state;
  }
};

interface ICreatorProvider {
  deployDAO: DAOTrigger;
  isSubDAO?: boolean;
  pending?: boolean;
  children: ReactNode;
}

export function CreatorProvider({ deployDAO, pending, isSubDAO, children }: ICreatorProvider) {
  const init = (_initialState: CreatorState) => {
    return {
      ..._initialState,
      govToken: { ..._initialState.govToken, parentAllocationAmount: isSubDAO ? '' : undefined },
    };
  };
  const [state, dispatch] = useReducer(reducer, initialState, init);
  const stepName = useStepName(state);

  // sets next/prev navigation
  useSteps(state, dispatch, isSubDAO);

  const value = useMemo(() => ({ state, dispatch, stepName }), [state, dispatch, stepName]);
  return (
    <CreatorContext.Provider value={value}>
      <div className="pb-16">
        <ConnectWalletToast label="To deploy a new Fractal" />
        <div>
          <H1>{stepName}</H1>
          {children}
          <StepButtons
            pending={pending}
            deployDAO={deployDAO}
            isSubDAO={isSubDAO}
          />
        </div>
      </div>
    </CreatorContext.Provider>
  );
}
