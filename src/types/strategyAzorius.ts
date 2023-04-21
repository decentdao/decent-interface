import {
  FractalUsul,
  OZLinearVoting,
  UsulVetoGuard,
  VotesToken,
  TokenClaim,
} from '@fractal-framework/fractal-contracts';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: FractalUsul;
  linearVotingMasterCopyContract: OZLinearVoting;
  azoriusVetoGuardMasterCopyContract: UsulVetoGuard;
  votesTokenMasterCopyContract: VotesToken;
  claimingMasterCopyContract: TokenClaim;
}
