import { useEffect, useState } from 'react';
import { logError } from '../helpers/errorLogging';
import { EthAddress } from '../types';

export type ContractAddressesChainMap = { [chaindId: number]: EthAddress };
export function useAddresses(chainId: number | undefined) {
  const [addresses, setAddresses] = useState<{
    daoFactory?: EthAddress;
    treasuryModuleFactory?: EthAddress;
    tokenFactory?: EthAddress;
    votesMasterCopy?: EthAddress;
    governorFactory?: EthAddress;
    claimFactory?: EthAddress;
    gnosisWrapperFactory?: EthAddress;
    gnosisSafeFactory?: EthAddress;
    usulMasterCopy?: EthAddress;
    linearVotingMasterCopy?: EthAddress;
    zodiacModuleProxyFactory?: EthAddress;
    dao?: EthAddress;
    accessControl?: EthAddress;
    treasuryModule?: EthAddress;
    governorModule?: EthAddress;
    timelock?: EthAddress;
    claimModule?: EthAddress;
    gnosisWrapper?: EthAddress;
    gnosisSafe?: EthAddress;
    multiSend?: EthAddress;
    fractalModuleMasterCopy?: EthAddress;
    fractalNameRegistry?: EthAddress;
    vetoGuardMasterCopy?: EthAddress;
    vetoMultisigVotingMasterCopy?: EthAddress;
    vetoERC20VotingMasterCopy?: EthAddress;
  }>({});

  useEffect(() => {
    if (!chainId) return;
    if (
      !process.env.REACT_APP_DAOFACTORY_ADDRESSES ||
      !process.env.REACT_APP_TREASURYMODULEFACTORY_ADDRESSES ||
      !process.env.REACT_APP_TOKENFACTORY_ADDRESSES ||
      !process.env.REACT_APP_GOVERNORFACTORY_ADDRESSES ||
      !process.env.REACT_APP_CLAIMFACTORY_ADDRESSES ||
      !process.env.REACT_APP_GNOSISWRAPPERFACTORY_ADDRESSES ||
      !process.env.REACT_APP_GNOSISSAFEFACTORY_ADDRESSES ||
      !process.env.REACT_APP_DAO_ADDRESSES ||
      !process.env.REACT_APP_ACCESSCONTROL_ADDRESSES ||
      !process.env.REACT_APP_TREASURYMODULE_ADDRESSES ||
      !process.env.REACT_APP_GOVERNORMODULE_ADDRESSES ||
      !process.env.REACT_APP_TIMELOCK_ADDRESSES ||
      !process.env.REACT_APP_CLAIM_ADDRESSES ||
      !process.env.REACT_APP_GNOSISWRAPPER_ADDRESSES ||
      !process.env.REACT_APP_GNOSISSAFE_ADDRESSES ||
      !process.env.REACT_APP_USUL_MASTERCOPY_ADDRESSES ||
      !process.env.REACT_APP_ZODIAC_PROXY_FACTORY_ADDRESSES ||
      !process.env.REACT_APP_ONE_TO_ONE_TOKEN_VOTING_MASTERCOPY_ADDRESSES ||
      !process.env.REACT_APP_GNOSIS_MULTISEND_ADDRESSES ||
      !process.env.REACT_APP_VOTES_TOKEN_MASTERCOPY_ADDRESSES ||
      !process.env.REACT_APP_FRACTAL_MODULE_MASTERCOPY_ADDRESSES ||
      !process.env.REACT_APP_FRACTAL_NAME_REGISTRY_ADDRESSES ||
      !process.env.REACT_APP_VETO_GUARD_ADDRESSES ||
      !process.env.REACT_APP_VETO_MULTISIG_VOTING_ADDRESSES ||
      !process.env.REACT_APP_VETO_ERC20_VOTING_ADDRESSES
    ) {
      logError('Addresses not set!');
      setAddresses({});
      return;
    }
    const daoFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_DAOFACTORY_ADDRESSES
    );
    const treasuryModuleFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_TREASURYMODULEFACTORY_ADDRESSES
    );
    const tokenFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_TOKENFACTORY_ADDRESSES
    );
    const governorFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GOVERNORFACTORY_ADDRESSES
    );
    const claimFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_CLAIMFACTORY_ADDRESSES
    );
    const gnosisWrapperFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GNOSISWRAPPERFACTORY_ADDRESSES
    );
    const gnosisSafeFactoryNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GNOSISSAFEFACTORY_ADDRESSES
    );
    const daoNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_DAO_ADDRESSES
    );
    const accessControlNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_ACCESSCONTROL_ADDRESSES
    );
    const treasuryModuleNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_TREASURYMODULE_ADDRESSES
    );
    const governorModuleNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GOVERNORMODULE_ADDRESSES
    );
    const timelockNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_TIMELOCK_ADDRESSES
    );
    const claimModuleNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_CLAIM_ADDRESSES
    );
    const gnosisWrapperNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GNOSISWRAPPER_ADDRESSES
    );
    const gnosisSafeNetworksAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GNOSISSAFE_ADDRESSES
    );
    const zodiacProxyFactoryAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_ZODIAC_PROXY_FACTORY_ADDRESSES
    );
    const usulMasterCopyAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_USUL_MASTERCOPY_ADDRESSES
    );
    const linearVotingMasterCopyAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_ONE_TO_ONE_TOKEN_VOTING_MASTERCOPY_ADDRESSES
    );
    const multiSendAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_GNOSIS_MULTISEND_ADDRESSES
    );
    const votesMasterCopyAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_VOTES_TOKEN_MASTERCOPY_ADDRESSES
    );
    const fractalModuleMasterCopyAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_FRACTAL_MODULE_MASTERCOPY_ADDRESSES
    );
    const fractalNameRegistryAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_FRACTAL_NAME_REGISTRY_ADDRESSES
    );
    const vetoGuardAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_VETO_GUARD_ADDRESSES
    );
    const vetoMultisigVotingAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_VETO_MULTISIG_VOTING_ADDRESSES
    );
    const vetoERC20VotingAddresses: ContractAddressesChainMap = JSON.parse(
      process.env.REACT_APP_VETO_ERC20_VOTING_ADDRESSES
    );

    const daoFactoryAddress = daoFactoryNetworksAddresses[chainId];
    const treasuryModuleFactoryAddress = treasuryModuleFactoryNetworksAddresses[chainId];
    const tokenFactoryAddress = tokenFactoryNetworksAddresses[chainId];
    const governorFactoryAddress = governorFactoryNetworksAddresses[chainId];
    const claimFactoryAddress = claimFactoryNetworksAddresses[chainId];
    const gnosisWrapperFactoryAddress = gnosisWrapperFactoryNetworksAddresses[chainId];
    const gnosisSafeFactoryAddress = gnosisSafeFactoryNetworksAddresses[chainId];
    const daoAddress = daoNetworksAddresses[chainId];
    const accessControlAddress = accessControlNetworksAddresses[chainId];
    const treasuryModuleAddress = treasuryModuleNetworksAddresses[chainId];
    const governorModuleAddress = governorModuleNetworksAddresses[chainId];
    const timelockAddress = timelockNetworksAddresses[chainId];
    const claimModuleAddress = claimModuleNetworksAddresses[chainId];
    const gnosisWrapperAddress = gnosisWrapperNetworksAddresses[chainId];
    const gnosisSafeAddress = gnosisSafeNetworksAddresses[chainId];
    const usulMasterCopy = usulMasterCopyAddresses[chainId];
    const zodiacModuleProxyFactory = zodiacProxyFactoryAddresses[chainId];
    const linearVotingMasterCopy = linearVotingMasterCopyAddresses[chainId];
    const multiSend = multiSendAddresses[chainId];
    const votesMasterCopy = votesMasterCopyAddresses[chainId];
    const fractalModuleMasterCopy = fractalModuleMasterCopyAddresses[chainId];
    const fractalNameRegistry = fractalNameRegistryAddresses[chainId];
    const vetoGuardMasterCopy = vetoGuardAddresses[chainId];
    const vetoMultisigVotingMasterCopy = vetoMultisigVotingAddresses[chainId];
    const vetoERC20VotingMasterCopy = vetoERC20VotingAddresses[chainId];

    if (
      !daoFactoryAddress ||
      !treasuryModuleFactoryAddress ||
      !tokenFactoryAddress ||
      !governorFactoryAddress ||
      !claimFactoryAddress ||
      !gnosisWrapperFactoryAddress ||
      !gnosisSafeFactoryAddress ||
      !daoAddress ||
      !accessControlAddress ||
      !treasuryModuleAddress ||
      !governorModuleAddress ||
      !timelockAddress ||
      !claimModuleAddress ||
      !gnosisWrapperAddress ||
      !gnosisSafeAddress ||
      !usulMasterCopy ||
      !zodiacModuleProxyFactory ||
      !linearVotingMasterCopy ||
      !multiSend ||
      !votesMasterCopy ||
      !fractalModuleMasterCopy ||
      !fractalNameRegistry ||
      !vetoGuardMasterCopy ||
      !vetoMultisigVotingMasterCopy ||
      !vetoERC20VotingMasterCopy
    ) {
      logError(`At least one address for network ${chainId} is not set!`);
      setAddresses({});
      return;
    }

    setAddresses({
      daoFactory: daoFactoryAddress,
      treasuryModuleFactory: treasuryModuleFactoryAddress,
      tokenFactory: tokenFactoryAddress,
      governorFactory: governorFactoryAddress,
      claimFactory: claimFactoryAddress,
      gnosisWrapperFactory: gnosisWrapperFactoryAddress,
      gnosisSafeFactory: gnosisSafeFactoryAddress,
      dao: daoAddress,
      accessControl: accessControlAddress,
      treasuryModule: treasuryModuleAddress,
      governorModule: governorModuleAddress,
      timelock: timelockAddress,
      claimModule: claimModuleAddress,
      gnosisWrapper: gnosisWrapperAddress,
      gnosisSafe: gnosisSafeAddress,
      usulMasterCopy,
      zodiacModuleProxyFactory,
      linearVotingMasterCopy,
      multiSend,
      votesMasterCopy,
      fractalModuleMasterCopy,
      fractalNameRegistry,
      vetoGuardMasterCopy,
      vetoMultisigVotingMasterCopy,
      vetoERC20VotingMasterCopy,
    });
  }, [chainId]);

  return addresses;
}
