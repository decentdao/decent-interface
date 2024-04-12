import { FreezeGuard } from '../../../types';
export enum FractalGuardAction {
  SET_FREEZE_GUARD = 'SET_FREEZE_GUARD',
  UPDATE_FREEZE_VOTE = 'UPDATE_FREEZE_VOTE', // listener dispatch for FreezeVoteCast event
}
export type FractalGuardActions =
  | { type: FractalGuardAction.SET_FREEZE_GUARD; payload: FreezeGuard }
  | {
      type: FractalGuardAction.UPDATE_FREEZE_VOTE;
      payload: {
        isVoter: boolean;
        freezeProposalCreatedTime: bigint;
        votesCast: bigint;
      };
    };
