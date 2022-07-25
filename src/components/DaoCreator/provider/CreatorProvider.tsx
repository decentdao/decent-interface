import { ReactNode, useMemo, useReducer } from 'react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import ConnectWalletToast from '../../ConnectWalletToast';
import { TextButton, SecondaryButton, PrimaryButton } from '../../ui/forms/Button';
import H1 from '../../ui/H1';
import LeftArrow from '../../ui/svg/LeftArrow';
import RightArrow from '../../ui/svg/RightArrow';
import { CreatorContext } from './hooks/useCreator';
import { useDeployDisabled } from './hooks/useDeployDisabled';
import { useNextDisabled } from './hooks/useNextDisabled';
import { useStepName } from './hooks/useStepName';
import { useSteps } from './hooks/useSteps';
import {
  CreatorProviderActions,
  CreatorProviderActionTypes,
  CreatorState,
  CreatorSteps,
  DAOTrigger,
} from './types';

export const initialState: CreatorState = {
  step: CreatorSteps.ESSENTIALS,
  prevStep: null,
  nextStep: null,
  essentials: {
    daoName: '',
  },
  govToken: {
    tokenName: '',
    tokenSupply: '',
    tokenSymbol: '',
    tokenAllocations: [{ address: '', amount: 0 }],
    pAllocation: undefined,
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
};

const reducer = (state: CreatorState, action: CreatorProviderActionTypes) => {
  switch (action.type) {
    case CreatorProviderActions.UPDATE_ESSENTIALS:
      return { ...state, essentials: { ...state.essentials, ...action.payload } };
    case CreatorProviderActions.UPDATE_FUNDING:
      return { ...state, funding: { ...state.funding, ...action.payload } };
    case CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN:
      return { ...state, govToken: { ...state.govToken, ...action.payload } };
    case CreatorProviderActions.UPDATE_GOV_CONFIG:
      return { ...state, govModule: { ...state.govModule, ...action.payload } };
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
  daoTrigger: DAOTrigger;
  isSubDAO?: boolean;
  pending?: boolean;
  children: ReactNode;
}

export function CreatorProvider({ daoTrigger, pending, isSubDAO, children }: ICreatorProvider) {
  const init = (_initialState: CreatorState) => {
    return {
      ..._initialState,
      govToken: { ..._initialState.govToken, pAllocation: isSubDAO ? '0' : undefined },
    };
  };
  const [state, dispatch] = useReducer(reducer, initialState, init);
  const stepName = useStepName(state);
  const {
    state: { account },
  } = useWeb3Provider();

  // sets next/prev navigation
  useSteps(state, dispatch, isSubDAO);
  const isNextDisabled = useNextDisabled(state);
  const deployLabel = useMemo(() => (isSubDAO ? 'Create subDAO Proposal' : 'Deploy'), [isSubDAO]);
  const isCreationReady = useDeployDisabled(state);

  const value = useMemo(() => ({ state, dispatch, stepName }), [state, dispatch, stepName]);
  return (
    <CreatorContext.Provider value={value}>
      <div className="pb-16">
        <ConnectWalletToast label="To deploy a new Fractal" />
        <div>
          <H1>{stepName}</H1>
          {children}
        </div>
      </div>
      <div className="flex items-center justify-center py-4">
        {state.prevStep !== null && (
          <TextButton
            onClick={() =>
              dispatch({
                type: CreatorProviderActions.SET_STEP,
                payload: state.prevStep!,
              })
            }
            disabled={pending}
            icon={<LeftArrow />}
            label="Prev"
          />
        )}
        {state.step < 3 && (
          <SecondaryButton
            onClick={() =>
              dispatch({
                type: CreatorProviderActions.SET_STEP,
                payload: state.nextStep!,
              })
            }
            disabled={isNextDisabled}
            isIconRight
            icon={<RightArrow />}
            label="Next"
          />
        )}
        {state.step === CreatorSteps.GOV_CONFIG && (
          <PrimaryButton
            onClick={() =>
              daoTrigger({
                ...state.essentials,
                ...state.funding,
                ...state.govModule,
                ...state.govToken,
              })
            }
            label={deployLabel}
            isLarge
            className="w-48"
            disabled={pending || !account || !isCreationReady}
          />
        )}
      </div>
    </CreatorContext.Provider>
  );
}
