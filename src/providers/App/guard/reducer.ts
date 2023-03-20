import { FreezeGuard } from '../../../types';
import { FractalGuardAction, FractalGuardActions } from './action';

export const initialGuardState: FreezeGuard = {
  freezeVotesThreshold: null,
  freezeProposalCreatedTime: null,
  freezeProposalVoteCount: null,
  freezeProposalPeriod: null,
  freezePeriod: null,
  userHasFreezeVoted: false,
  isFrozen: false,
  userHasVotes: false,
};

export function guardReducer(state: FreezeGuard, action: FractalGuardActions) {
  switch (action.type) {
    case FractalGuardAction.SET_FREEZE_GUARD: {
      return action.payload;
    }
    case FractalGuardAction.UPDATE_FREEZE_VOTE: {
      const { isVoter, votesCast } = action.payload;
      return { ...state, userHasFreezeVoted: isVoter, freezeProposalVoteCount: votesCast };
    }
    case FractalGuardAction.RESET:
      return initialGuardState;
    default:
      return state;
  }
}
