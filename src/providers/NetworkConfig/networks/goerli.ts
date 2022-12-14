import { NetworkConfig } from '../NetworkConfigProvider';

export const goerliConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-goerli.safe.global',
  contracts: {
    gnosisSafe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    gnosisSafeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    zodiacModuleProxyFactory: '0x740020d3B1BF3E64e84dbA7175fC560B85EdB9bC',
    linearVotingMasterCopy: '0x948db5691cc97AEcb4fF5FfcAEb72594B74D9D52',
    gnosisMultisend: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    fractalUsulMasterCopy: '0x985e9fc210434b01d3DeF715b4FC8deee034840D',
    fractalModuleMasterCopy: '0xa7c367d5fF8b40C47e098f1daB91899cc2d504A7',
    fractalNameRegistry: '0x714A662C49cf3Ff22C0d17d25C08EcE632c83008',
    votesTokenMasterCopy: '0x41128f1E1F2A2De4120606C8e840304DB926D190',
    claimingFactory: '0x4B9EB3B2c649dA44B71aD3960BB2062dCC7AA955',
    claimingMasterCopy: '0x71F458F6EB6F23A6bCED98875cA9DCF245c972E1',
    gnosisVetoGuardMasterCopy: '0x813cb6D97d95C89E98cd7d0591485c000E75e6d4',
    usulVetoGuardMasterCopy: '0xF28c885256f35e342adBDA195db2A5366A79eA9f',
    vetoMultisigVotingMasterCopy: '0xE718E314ce89e3F4aD513f3BaF8b9f97B3A5844c',
    vetoERC20VotingMasterCopy: '0xfaf4f637989730fE92F6fCb1964f7b36a1a841ce',
  },
};
