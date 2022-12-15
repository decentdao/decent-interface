import { BigNumber } from 'ethers';

export type FreezeVoteCastedListener = (voter: string, votesCast: BigNumber, _: any) => void;
