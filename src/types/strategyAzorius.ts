import {
  Azorius,
  LinearERC20Voting,
  AzoriusFreezeGuard,
  VotesERC20,
  ERC20Claim,
  VotesERC20Wrapper,
  LinearERC721Voting,
} from './contract';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: Azorius;
  linearVotingMasterCopyContract: LinearERC20Voting;
  linearVotingERC721MasterCopyContract: LinearERC721Voting;
  azoriusFreezeGuardMasterCopyContract: AzoriusFreezeGuard;
  votesTokenMasterCopyContract: VotesERC20;
  claimingMasterCopyContract: ERC20Claim;
  votesERC20WrapperMasterCopyContract: VotesERC20Wrapper;
}
