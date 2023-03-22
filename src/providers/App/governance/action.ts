import { BigNumber } from 'ethers';
import { FractalGovernance } from '../../../types';

export enum FractalGovernanceAction {
  SET_GOVERNANCE,
  UPDATE_PROPOSALS_NEW,
  UPDATE_PROPOSALS_STATE,
  UPDATE_VOTING_PERIOD,
  UPDATE_VOTING_QUORUM,
  UPDATE_TIMELOCK_PERIOD,
  RESET,
}

export type FractalGovernanceActions =
  | { type: FractalGovernanceAction.SET_GOVERNANCE; payload: FractalGovernance }
  // @todo update with proposal type
  | { type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW; payload: any }
  // @todo update with proposal state
  | {
      type: FractalGovernanceAction.UPDATE_PROPOSALS_STATE;
      payload: { state: any; proposalNumber: BigNumber };
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_PERIOD;
      payload: { votingPeriod: BigNumber; proposalNumber: BigNumber };
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_QUORUM;
      payload: { votingQuorum: BigNumber; proposalNumber: BigNumber };
    }
  | {
      type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD;
      payload: { timelockPeriod: BigNumber; proposalNumber: BigNumber };
    }
  | { type: FractalGovernanceAction.RESET };
