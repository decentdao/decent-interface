import {
  FractalUsul,
  OZLinearVoting,
  UsulVetoGuard,
  VotesToken,
  TokenClaim,
} from '@fractal-framework/fractal-contracts';
import { VotesERC20Wrapper } from './../assets/typechain-types/VotesERC20Wrapper';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: FractalUsul;
  linearVotingMasterCopyContract: OZLinearVoting;
  azoriusVetoGuardMasterCopyContract: UsulVetoGuard;
  votesTokenMasterCopyContract: VotesToken;
  claimingMasterCopyContract: TokenClaim;
  votesERC20WrapperMasterCopyContract: VotesERC20Wrapper;
}
