import {
  Azorius,
  LinearERC20Voting,
  AzoriusFreezeGuard,
  VotesERC20,
  ERC20Claim,
} from '@fractal-framework/fractal-contracts';
import { VotesERC20Wrapper } from './../assets/typechain-types/VotesERC20Wrapper';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: Azorius;
  linearVotingMasterCopyContract: LinearERC20Voting;
  azoriusVetoGuardMasterCopyContract: AzoriusFreezeGuard;
  votesTokenMasterCopyContract: VotesERC20;
  claimingMasterCopyContract: ERC20Claim;
  votesERC20WrapperMasterCopyContract: VotesERC20Wrapper;
}
