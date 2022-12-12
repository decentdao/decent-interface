import { NetworkConfig } from '../NetworkConfigProvider';

export const mainnetConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  contracts: {
    gnosisSafe: '',
    gnosisSafeFactory: '',
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    gnosisMultisend: '',
    usulMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalNameRegistry: '',
    votesTokenMasterCopy: '',
    claimingFactory: '',
    claimingMasterCopy: '',
    gnosisVetoGuardMasterCopy: '0x7d817caD2eC343C2aEa5FfEa1bEBaCB0A71165c6',
    usulVetoGuardMasterCopy: '0xF28c885256f35e342adBDA195db2A5366A79eA9f', // todo: this needs to change
    vetoMultisigVotingMasterCopy: '0xaf593302eAd44C054901d32e03Bf39Ec14a8ef06',
    vetoERC20VotingMasterCopy: '0xEAA8B09e64b3cdAF342976e4543e999cA9903cDE',
  },
};
