import { BigNumber } from 'ethers';
import { ContractEvent } from '../../../types/contract';

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

export interface ProposalDataWithoutUserData extends ContractEvent {
  number: number;
  id: BigNumber;
  idSubstring: string | undefined;
  startBlock: BigNumber;
  endBlock: BigNumber;
  startTime: Date | undefined;
  endTime: Date | undefined;
  startTimeString: string | undefined;
  endTimeString: string | undefined;
  proposer: string;
  targets: string[];
  signatures: string[];
  calldatas: string[];
  values: BigNumber[];
  description: string;
  state: ProposalState | undefined;
  forVotesCount: BigNumber | undefined;
  againstVotesCount: BigNumber | undefined;
  abstainVotesCount: BigNumber | undefined;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
  eta: number | undefined;
}
export interface ProposalData extends ProposalDataWithoutUserData {
  userVote: number | undefined;
  userVoteString: 'For' | 'Against' | 'Abstain' | undefined; // TODO should we translate on chain data?
  userVotePower: BigNumber | undefined;
}

export type UserVote = {
  proposalId: BigNumber;
  vote: number | undefined;
};

export type UserVotePower = {
  proposalId: BigNumber;
  votePower: BigNumber | undefined;
};
