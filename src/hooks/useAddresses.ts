import { useState, useEffect } from 'react';
import { logError } from '../helpers/errorLogging';

export function useAddresses(chainId: number | undefined) {
  const [addresses, setAddresses] = useState<{
    metaFactory?: { address: string };
    daoFactory?: { address: string };
    treasuryModuleFactory?: { address: string };
    tokenFactory?: { address: string };
    votesMasterCopy?: { address: string };
    governorFactory?: { address: string };
    claimFactory?: { address: string };
    gnosisWrapperFactory?: { address: string };
    gnosisSafeFactory?: { address: string };
    usulMastercopy?: { address: string };
    linearVotingMastercopy?: { address: string };
    zodiacModuleProxyFactory?: { address: string };
    dao?: { address: string };
    accessControl?: { address: string };
    treasuryModule?: { address: string };
    governorModule?: { address: string };
    timelock?: { address: string };
    claimModule?: { address: string };
    gnosisWrapper?: { address: string };
    gnosisSafe?: { address: string };
    multiSend?: { address: string };
    fractalModuleMastercopy?: { address: string };
  }>({});

  useEffect(() => {
    if (!chainId) return;
    if (
      !process.env.REACT_APP_METAFACTORY_ADDRESSES ||
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
      !process.env.REACT_APP_FRACTAL_MODULE_MASTERCOPY_ADDRESSES
    ) {
      logError('Addresses not set!');
      setAddresses({});
      return;
    }

    const metaFactoryNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_METAFACTORY_ADDRESSES
    );
    const daoFactoryNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_DAOFACTORY_ADDRESSES
    );
    const treasuryModuleFactoryNetworksAddresses: { [chaindId: number]: { address: string } } =
      JSON.parse(process.env.REACT_APP_TREASURYMODULEFACTORY_ADDRESSES);
    const tokenFactoryNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_TOKENFACTORY_ADDRESSES
    );
    const governorFactoryNetworksAddresses: { [chaindId: number]: { address: string } } =
      JSON.parse(process.env.REACT_APP_GOVERNORFACTORY_ADDRESSES);
    const claimFactoryNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_CLAIMFACTORY_ADDRESSES
    );
    const gnosisWrapperFactoryNetworksAddresses: { [chaindId: number]: { address: string } } =
      JSON.parse(process.env.REACT_APP_GNOSISWRAPPERFACTORY_ADDRESSES);
    const gnosisSafeFactoryNetworksAddresses: { [chaindId: number]: { address: string } } =
      JSON.parse(process.env.REACT_APP_GNOSISSAFEFACTORY_ADDRESSES);
    const daoNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_DAO_ADDRESSES
    );
    const accessControlNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_ACCESSCONTROL_ADDRESSES
    );
    const treasuryModuleNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_TREASURYMODULE_ADDRESSES
    );
    const governorModuleNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_GOVERNORMODULE_ADDRESSES
    );
    const timelockNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_TIMELOCK_ADDRESSES
    );
    const claimModuleNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_CLAIM_ADDRESSES
    );
    const gnosisWrapperNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_GNOSISWRAPPER_ADDRESSES
    );
    const gnosisSafeNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_GNOSISSAFE_ADDRESSES
    );
    const zodiacProxyFactoryAddresses: { [chainId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_ZODIAC_PROXY_FACTORY_ADDRESSES
    );
    const usulMastercopyAddresses: { [chainId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_USUL_MASTERCOPY_ADDRESSES
    );
    const linearVotingMastercopyAddresses: { [chainId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_ONE_TO_ONE_TOKEN_VOTING_MASTERCOPY_ADDRESSES
    );
    const multiSendAddresses: { [chainId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_GNOSIS_MULTISEND_ADDRESSES
    );
    const votesMasterCopyAddresses: { [chainId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_VOTES_TOKEN_MASTERCOPY_ADDRESSES
    );
    const fractalModuleMastercopyAddresses: { [chainId: number]: { address: string } } = JSON.parse(
      process.env.REACT_APP_FRACTAL_MODULE_MASTERCOPY_ADDRESSES
    );

    const metaFactoryAddress: { address: string } = metaFactoryNetworksAddresses[chainId];
    const daoFactoryAddress: { address: string } = daoFactoryNetworksAddresses[chainId];
    const treasuryModuleFactoryAddress: { address: string } =
      treasuryModuleFactoryNetworksAddresses[chainId];
    const tokenFactoryAddress: { address: string } = tokenFactoryNetworksAddresses[chainId];
    const governorFactoryAddress: { address: string } = governorFactoryNetworksAddresses[chainId];
    const claimFactoryAddress: { address: string } = claimFactoryNetworksAddresses[chainId];
    const gnosisWrapperFactoryAddress: { address: string } =
      gnosisWrapperFactoryNetworksAddresses[chainId];
    const gnosisSafeFactoryAddress: { address: string } =
      gnosisSafeFactoryNetworksAddresses[chainId];
    const daoAddress: { address: string } = daoNetworksAddresses[chainId];
    const accessControlAddress: { address: string } = accessControlNetworksAddresses[chainId];
    const treasuryModuleAddress: { address: string } = treasuryModuleNetworksAddresses[chainId];
    const governorModuleAddress: { address: string } = governorModuleNetworksAddresses[chainId];
    const timelockAddress: { address: string } = timelockNetworksAddresses[chainId];
    const claimModuleAddress: { address: string } = claimModuleNetworksAddresses[chainId];
    const gnosisWrapperAddress: { address: string } = gnosisWrapperNetworksAddresses[chainId];
    const gnosisSafeAddress: { address: string } = gnosisSafeNetworksAddresses[chainId];
    const usulMastercopy: { address: string } = usulMastercopyAddresses[chainId];
    const zodiacModuleProxyFactory: { address: string } = zodiacProxyFactoryAddresses[chainId];
    const linearVotingMastercopy: { address: string } = linearVotingMastercopyAddresses[chainId];
    const multiSend: { address: string } = multiSendAddresses[chainId];
    const votesMasterCopy: { address: string } = votesMasterCopyAddresses[chainId];
    const fractalModuleMastercopy: { address: string } = fractalModuleMastercopyAddresses[chainId];

    if (
      !metaFactoryAddress ||
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
      !usulMastercopy ||
      !zodiacModuleProxyFactory ||
      !linearVotingMastercopy ||
      !multiSend ||
      !votesMasterCopy ||
      !fractalModuleMastercopy
    ) {
      logError(`At least one address for network ${chainId} is not set!`);
      setAddresses({});
      return;
    }

    setAddresses({
      metaFactory: metaFactoryAddress,
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
      usulMastercopy,
      zodiacModuleProxyFactory,
      linearVotingMastercopy,
      multiSend,
      votesMasterCopy,
      fractalModuleMastercopy
    });
  }, [chainId]);

  return addresses;
}
