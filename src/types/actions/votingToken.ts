import { VotesToken } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { TokenAccountRaw, BNFormattedPair, ITokenData } from '../votingFungibleToken';

export enum TokenActions {
  UPDATE_TOKEN,
  UPDATE_DELEGATEE,
  UPDATE_VOTING_WEIGHTS,
  UPDATE_ACCOUNT,
  UPDATE_VOTING_CONTRACT,
  UPDATE_TOKEN_CONTRACT,
  RESET,
}

export type TokenAction =
  | { type: TokenActions.UPDATE_TOKEN; payload: ITokenData }
  | {
      type: TokenActions.UPDATE_ACCOUNT;
      payload: TokenAccountRaw;
    }
  | { type: TokenActions.UPDATE_DELEGATEE; payload: string }
  | {
      type: TokenActions.UPDATE_VOTING_WEIGHTS;
      payload: { votingWeight: BigNumber };
    }
  | {
      type: TokenActions.UPDATE_VOTING_CONTRACT;
      payload: {
        votingPeriod: BNFormattedPair;
        quorumPercentage: BNFormattedPair;
        timeLockPeriod: BNFormattedPair;
      };
    }
  | { type: TokenActions.UPDATE_TOKEN_CONTRACT; payload: VotesToken }
  | { type: TokenActions.RESET };
