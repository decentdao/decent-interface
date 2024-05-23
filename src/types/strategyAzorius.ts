import {
  Azorius,
  AzoriusFreezeGuard,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';

export interface AzoriusContracts {
  fractalAzoriusMasterCopyContract: Azorius;
  linearVotingERC721MasterCopyContract: LinearERC721Voting;
  azoriusFreezeGuardMasterCopyContract: AzoriusFreezeGuard;
}
