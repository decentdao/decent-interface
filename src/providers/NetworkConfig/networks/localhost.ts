import { NetworkConfig } from '../NetworkConfigProvider';

export const localhostConfig: NetworkConfig = {
  // @note localhost config should be 1:1 with goerli configurations for testing.
  safeBaseURL: 'https://safe-transaction-goerli.safe.global',
  contracts: {
    gnosisSafe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    gnosisSafeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    zodiacModuleProxyFactory: '0x740020d3B1BF3E64e84dbA7175fC560B85EdB9bC',
    linearVotingMasterCopy: '0x948db5691cc97AEcb4fF5FfcAEb72594B74D9D52',
    gnosisMultisend: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    fractalUsulMasterCopy: '0xCdea1582a57Ca4A678070Fa645aaf3a40c2164C1',
    fractalModuleMasterCopy: '0x260BcebDb25fa17f63972010E7b4EfC5C1D0fE0f',
    fractalNameRegistry: '0x14d56CE23F76921203b1a092744A067D7d8963c2',
    votesTokenMasterCopy: '0x0697DCa73151da93D18CDdF5DB52f9A8363c9Ba9',
    claimingFactory: '0x4B9EB3B2c649dA44B71aD3960BB2062dCC7AA955',
    claimingMasterCopy: '0x15b099e0Ad85c0d10efba09c05C9e8dB1cDa61a8',
  },
};
