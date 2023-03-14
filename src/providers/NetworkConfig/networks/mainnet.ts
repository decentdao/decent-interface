import { mainnet } from 'wagmi/chains';
import ethDefault from '../../../assets/images/coin-icon-eth.svg';
import { NetworkConfig } from '../types';

export const mainnetConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  chainId: 1,
  name: mainnet.name,
  color: 'green.300',
  nativeTokenSymbol: mainnet.nativeCurrency.symbol,
  nativeTokenIcon: ethDefault,
  wagmiChain: mainnet,
  contracts: {
    gnosisSafe: '',
    gnosisSafeFactory: '',
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    gnosisMultisend: '',
    fractalUsulMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalRegistry: '',
    votesTokenMasterCopy: '',
    claimingMasterCopy: '',
    gnosisVetoGuardMasterCopy: '',
    usulVetoGuardMasterCopy: '',
    vetoMultisigVotingMasterCopy: '',
    vetoERC20VotingMasterCopy: '',
  },
};
