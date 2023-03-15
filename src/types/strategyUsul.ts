import {
  FractalUsul,
  OZLinearVoting,
  UsulVetoGuard,
  VotesToken,
  TokenClaim,
} from '@fractal-framework/fractal-contracts';

export interface UsulContracts {
  fractalUsulMasterCopyContract: FractalUsul;
  linearVotingMasterCopyContract: OZLinearVoting;
  usulVetoGuardMasterCopyContract: UsulVetoGuard;
  votesTokenMasterCopyContract: VotesToken;
  claimingMasterCopyContract: TokenClaim;
}
