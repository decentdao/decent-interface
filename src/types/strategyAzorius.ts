import {
  Azorius,
  LinearERC20Voting,
  AzoriusFreezeGuard,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: Azorius;
  linearVotingMasterCopyContract: LinearERC20Voting;
  linearVotingERC721MasterCopyContract: LinearERC721Voting;
  azoriusFreezeGuardMasterCopyContract: AzoriusFreezeGuard;
}
