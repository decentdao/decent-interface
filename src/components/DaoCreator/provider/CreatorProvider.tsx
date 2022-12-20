import { Box, Text } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { ReactNode, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import ConnectWalletToast from '../../ConnectWalletToast';
import { StepButtons } from '../StepButtons';

import { CreatorContext } from './hooks/useCreator';
import { useStepName } from './hooks/useStepName';
import { useSteps } from './hooks/useSteps';
import {
  CreatorProviderActionTypes,
  CreatorProviderActions,
  CreatorState,
  CreatorSteps,
  DAOTrigger,
  GovernanceTypes,
} from './types';

export const initialState: CreatorState = {
  step: CreatorSteps.ESSENTIALS,
  prevStep: null,
  nextStep: null,
  governance: GovernanceTypes.GNOSIS_SAFE,
  essentials: {
    daoName: '',
  },
  govToken: {
    tokenName: '',
    tokenSupply: {
      value: '',
      bigNumberValue: null,
    },
    tokenSymbol: '',
    tokenAllocations: [
      {
        address: '',
        isValidAddress: false,
        amount: {
          value: '',
          bigNumberValue: null,
        },
      },
    ],
    parentAllocationAmount: undefined,
  },
  govModule: {
    quorumPercentage: BigNumber.from(4),
    timelock: BigNumber.from(172800),
    votingPeriod: BigNumber.from(604800),
  },
  vetoGuard: {
    executionPeriod: BigNumber.from(172800),
    timelockPeriod: BigNumber.from(172800),
    vetoVotesThreshold: BigNumber.from(1),
    freezeVotesThreshold: BigNumber.from(1),
    freezeProposalPeriod: BigNumber.from(604800),
    freezePeriod: BigNumber.from(604800),
  },
  funding: {
    tokensToFund: [],
    nftsToFund: [],
  },
  gnosis: {
    trustedAddresses: [{ address: '', isValidAddress: false }],
    signatureThreshold: '1',
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
    case CreatorProviderActions.UPDATE_GUARD_CONFIG:
      return { ...state, vetoGuard: { ...state.vetoGuard, ...action.payload } };
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
      govToken: {
        ..._initialState.govToken,
        parentAllocationAmount: isSubDAO ? { value: '', bigNumberValue: null } : undefined,
      },
    };
  };
  const [state, dispatch] = useReducer(reducer, initialState, init);
  const stepName = useStepName(state);

  // sets next/prev navigation
  useSteps(state, dispatch, isSubDAO);

  const value = useMemo(() => ({ state, dispatch, stepName }), [state, dispatch, stepName]);
  const { t } = useTranslation('daoCreate');

  return (
    <CreatorContext.Provider value={value}>
      <Box p="8">
        <ConnectWalletToast label={t('labelConnectWallet')} />
        <Box>
          <Text textStyle="text-2xl-mono-bold">{stepName}</Text>
          {children}
          <StepButtons
            pending={pending}
            deployDAO={deployDAO}
            isSubDAO={isSubDAO}
          />
        </Box>
      </Box>
    </CreatorContext.Provider>
  );
}
