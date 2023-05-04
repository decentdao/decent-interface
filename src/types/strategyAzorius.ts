import {
  Azorius,
  LinearERC20Voting,
  AzoriusFreezeGuard,
  VotesERC20,
  ERC20Claim,
  VotesERC20Wrapper,
} from '@fractal-framework/fractal-contracts';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: Azorius;
  linearVotingMasterCopyContract: LinearERC20Voting;
  azoriusVetoGuardMasterCopyContract: AzoriusFreezeGuard;
  votesTokenMasterCopyContract: VotesERC20;
  claimingMasterCopyContract: ERC20Claim;
  votesERC20WrapperMasterCopyContract: VotesERC20Wrapper;
}
