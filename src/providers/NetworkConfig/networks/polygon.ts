import FractalModule from '@fractal-framework/fractal-contracts/deployments/polygon/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/polygon/FractalRegistry.json';
import FractalUsul from '@fractal-framework/fractal-contracts/deployments/polygon/FractalUsul.json';
import ZodiacModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/polygon/ModuleProxyFactory.json';
import LinearVotingMasterCopy from '@fractal-framework/fractal-contracts/deployments/polygon/OZLinearVoting.json';
import TokenClaim from '@fractal-framework/fractal-contracts/deployments/polygon/TokenClaim.json';
import UsulVetoGuard from '@fractal-framework/fractal-contracts/deployments/polygon/UsulVetoGuard.json';
import VetoERC20Voting from '@fractal-framework/fractal-contracts/deployments/polygon/VetoERC20Voting.json';
import VetoGuard from '@fractal-framework/fractal-contracts/deployments/polygon/VetoGuard.json';
import VetoMultisigVoting from '@fractal-framework/fractal-contracts/deployments/polygon/VetoMultisigVoting.json';
import VotesToken from '@fractal-framework/fractal-contracts/deployments/polygon/VotesToken.json';
import polygonDefault from '../../assets/images/coin-icon-polygon.svg';
import { NetworkConfig } from '../types';

export const polygonConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-polygon.safe.global',
  etherscanBaseURL: 'https://polygonscan.com',
  chainId: 137,
  nameKey: 'polygon',
  color: '#562FB0',
  nativeTokenSymbol: 'MATIC',
  nativeTokenIcon: polygonDefault,
  contracts: {
    fractalUsulMasterCopy: FractalUsul.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesTokenMasterCopy: VotesToken.address,
    claimingMasterCopy: TokenClaim.address,
    usulVetoGuardMasterCopy: UsulVetoGuard.address,
    vetoMultisigVotingMasterCopy: VetoMultisigVoting.address,
    vetoERC20VotingMasterCopy: VetoERC20Voting.address,
    gnosisVetoGuardMasterCopy: VetoGuard.address,
    gnosisSafe: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    gnosisSafeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    zodiacModuleProxyFactory: ZodiacModuleProxyFactory.address,
    linearVotingMasterCopy: LinearVotingMasterCopy.address,
    gnosisMultisend: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
  },
};
