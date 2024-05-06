import {
  Azorius,
  LinearERC20Voting,
  AzoriusFreezeGuard,
  ERC20Claim,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: Azorius;
  linearVotingMasterCopyContract: LinearERC20Voting;
  linearVotingERC721MasterCopyContract: LinearERC721Voting;
  azoriusFreezeGuardMasterCopyContract: AzoriusFreezeGuard;
  claimingMasterCopyContract: ERC20Claim;
}
