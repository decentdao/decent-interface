import { GnosisAction, gnosisInitialState } from '../constants';
import { GnosisActions, IGnosis } from '../types';

export const initializeGnosisState = (_initialState: IGnosis) => {
  return _initialState;
};

export const gnosisReducer = (state: IGnosis, action: GnosisActions): IGnosis => {
  switch (action.type) {
    // sets Safe Service Client on Load
    case GnosisAction.SET_SAFE_SERVICE_CLIENT:
      return { ...state, safeService: action.payload };
    // valid url param is set to start loading of DAO, this acts as a reset in cases that a DAO is already laoded.
    // @note safeService is preserved and doesn't need to be reset
    case GnosisAction.SET_SAFE_ADDRESS:
      return {
        ...gnosisInitialState,
        safeService: state.safeService,
        providedSafeAddress: action.payload,
      };
    // set safe info directly from Global Safe api using providedSafeAddress
    case GnosisAction.SET_SAFE:
      return { ...state, safe: { ...action.payload } };
    // sets usul and multisig transactions of currently loaded DAO
    case GnosisAction.SET_SAFE_TRANSACTIONS:
      return { ...state, transactions: { ...action.payload }, isGnosisLoading: false };
    // stores install modules of currently loaded DAO
    case GnosisAction.SET_MODULES:
      return { ...state, modules: action.payload, isGnosisLoading: false };
    case GnosisAction.SET_GUARD_CONTRACTS:
      return { ...state, guardContracts: { ...action.payload } };
    case GnosisAction.SET_FREEZE_DATA:
      return { ...state, freezeData: { ...action.payload } };
    case GnosisAction.FREEZE_VOTE_EVENT: {
      if (!state.freezeData) {
        return { ...state };
      }
      const freezeData = state.freezeData;
      const { isVoter, freezeProposalCreatedTime, freezeProposalVoteCount } = action.payload;
      const userHasFreezeVoted = isVoter;
      const isFrozen = freezeProposalVoteCount.gte(freezeData.freezeVotesThreshold);
      return {
        ...state,
        freezeData: {
          ...freezeData,
          freezeProposalVoteCount,
          userHasFreezeVoted,
          isFrozen,
          freezeProposalCreatedTime,
        },
        isGnosisLoading: false,
      };
    }
    case GnosisAction.SET_DAO_NAME:
      return { ...state, daoName: action.payload };
    case GnosisAction.SET_DAO_PARENT:
      return { ...state, parentDAOAddress: action.payload };
    case GnosisAction.SET_DAO_CHILDREN:
      return { ...state, childNodes: action.payload, isNodesLoaded: true };
    // resets DAO
    case GnosisAction.INVALIDATE:
    case GnosisAction.RESET:
      // @note safeService is preserved and doesn't need to be reset
      return initializeGnosisState({ ...gnosisInitialState, safeService: state.safeService });
    default:
      return state;
  }
};
