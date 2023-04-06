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
      const { isVoter, votesCast, freezeProposalCreatedTime } = action.payload;
      const isFrozen = votesCast.gte(state.freezeVotesThreshold || 0);
      const userHasFreezeVoted = isVoter || state.userHasVotes;
      const userHasVotes = !userHasFreezeVoted || state.userHasVotes;
      return {
        ...state,
        userHasFreezeVoted,
        freezeProposalVoteCount: votesCast,
        freezeProposalCreatedTime,
        isFrozen,
        userHasVotes,
      };
    }
    default:
      return state;
  }
}
