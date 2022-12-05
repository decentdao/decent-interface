import { NetworkConfig } from '../NetworkConfigProvider';

export const goerliConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-goerli.safe.global',
  contracts: {
    gnosisSafe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    gnosisSafeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    zodiacModuleProxyFactory: '0x740020d3B1BF3E64e84dbA7175fC560B85EdB9bC',
    linearVotingMasterCopy: '0x948db5691cc97AEcb4fF5FfcAEb72594B74D9D52',
    gnosisMultisend: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    usulMasterCopy: '0xCdea1582a57Ca4A678070Fa645aaf3a40c2164C1',
    fractalModuleMasterCopy: '0x78193b2fd8292Fb35DD90C45dC304B2A10125D68',
    fractalNameRegistry: '0xBdE1D5bd4007973A4BD4D9b1b3a4d4BE1Bc7C4F2',
    votesTokenMasterCopy: '0xe4dB69c0A5Ef88a73083cdC190379675bE7EcBFa',
    claimingFactory: '0x4B9EB3B2c649dA44B71aD3960BB2062dCC7AA955',
    claimingMasterCopy: '0x703935eb5a35E586C23C269Db0C55da0ad02C4bf',
    gnosisVetoGuardMasterCopy: '0x7d817caD2eC343C2aEa5FfEa1bEBaCB0A71165c6',
    usulVetoGuardMasterCopy: '0x7d817caD2eC343C2aEa5FfEa1bEBaCB0A71165c6', // todo: this needs to change
    vetoMultisigVotingMasterCopy: '0xaf593302eAd44C054901d32e03Bf39Ec14a8ef06',
    vetoERC20VotingMasterCopy: '0xEAA8B09e64b3cdAF342976e4543e999cA9903cDE',
  },
};
