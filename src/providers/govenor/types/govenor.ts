export const typers = {};

import { BigNumber } from 'ethers';

export type VoteCastListener = (
  voter: string,
  proposalId: BigNumber,
  support: number,
  weight: BigNumber,
  reason: string,
  _: any
) => void;

export type ProposalCreatedListener = (
  proposalId: BigNumber,
  proposer: string,
  targets: string[],
  values: BigNumber[],
  signatures: string[],
  calldatas: string[],
  startBlock: BigNumber,
  endBlock: BigNumber,
  description: string,
  _: any
) => void;

export type ProposalQueuedListener = (proposalId: BigNumber, _: any) => void;

export type ProposalExecutedListener = (proposalId: BigNumber, _: any) => void;
