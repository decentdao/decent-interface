import { useState, useEffect } from 'react';

export function useAddresses(chainId: number | undefined) {
  const [addresses, setAddresses] = useState<{
    metaFactory?: { address: string };
    daoFactory?: { address: string };
    treasuryModuleFactory?: { address: string };
    tokenFactory?: { address: string };
    governorFactory?: { address: string };
    claimFactory?: { address: string };
    gnosisWrapperFactory?: { address: string };
    gnosisSafeFactory?: { address: string };
    dao?: { address: string };
    accessControl?: { address: string };
    treasuryModule?: { address: string };
    governorModule?: { address: string };
    timelock?: { address: string };
    claimModule?: { address: string };
    gnosisWrapper?: { address: string };
    gnosisSafe?: { address: string };
  }>({});

  useEffect(() => {
    if (!chainId) return;

    if (
      process.env.REACT_APP_LOCAL_CHAIN_ID &&
      chainId === parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID)
    ) {
      if (
        !process.env.REACT_APP_LOCAL_METAFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_DAOFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_TREASURYMODULEFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_TOKENFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GOVERNORFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_CLAIMFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GNOSISWRAPPERFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GNOSISSAFEFACTORY_ADDRESS ||
        !process.env.REACT_APP_LOCAL_DAO_ADDRESS ||
        !process.env.REACT_APP_LOCAL_ACCESSCONTROL_ADDRESS ||
        !process.env.REACT_APP_LOCAL_TREASURYMODULE_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GOVERNORMODULE_ADDRESS ||
        !process.env.REACT_APP_LOCAL_TIMELOCK_ADDRESS ||
        !process.env.REACT_APP_LOCAL_CLAIM_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GNOSISWRAPPER_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GNOSISSAFE_ADDRESS
      ) {
        console.error('Local addresses not set!');
        setAddresses({});
        return;
      }

      setAddresses({
        metaFactory: JSON.parse(process.env.REACT_APP_LOCAL_METAFACTORY_ADDRESS),
        daoFactory: JSON.parse(process.env.REACT_APP_LOCAL_DAOFACTORY_ADDRESS),
        treasuryModuleFactory: JSON.parse(
          process.env.REACT_APP_LOCAL_TREASURYMODULEFACTORY_ADDRESS
        ),
        tokenFactory: JSON.parse(process.env.REACT_APP_LOCAL_TOKENFACTORY_ADDRESS),
        governorFactory: JSON.parse(process.env.REACT_APP_LOCAL_GOVERNORFACTORY_ADDRESS),
        claimFactory: JSON.parse(process.env.REACT_APP_LOCAL_CLAIMFACTORY_ADDRESS),
        gnosisWrapperFactory: JSON.parse(process.env.REACT_APP_LOCAL_GNOSISWRAPPERFACTORY_ADDRESS),
        gnosisSafeFactory: JSON.parse(process.env.REACT_APP_LOCAL_GNOSISSAFEFACTORY_ADDRESS),
        dao: JSON.parse(process.env.REACT_APP_LOCAL_DAO_ADDRESS),
        accessControl: JSON.parse(process.env.REACT_APP_LOCAL_ACCESSCONTROL_ADDRESS),
        treasuryModule: JSON.parse(process.env.REACT_APP_LOCAL_TREASURYMODULE_ADDRESS),
        governorModule: JSON.parse(process.env.REACT_APP_LOCAL_GOVERNORMODULE_ADDRESS),
        timelock: JSON.parse(process.env.REACT_APP_LOCAL_TIMELOCK_ADDRESS),
        claimModule: JSON.parse(process.env.REACT_APP_LOCAL_CLAIM_ADDRESS),
        gnosisWrapper: JSON.parse(process.env.REACT_APP_LOCAL_GNOSISWRAPPER_ADDRESS),
        gnosisSafe: JSON.parse(process.env.REACT_APP_LOCAL_GNOSISSAFE_ADDRESS),
      });
    } else {
      if (
        !process.env.REACT_APP_METAFACTORY_ADDRESSES ||
        !process.env.REACT_APP_DAOFACTORY_ADDRESSES ||
        !process.env.REACT_APP_TREASURYMODULEFACTORY_ADDRESSES ||
        !process.env.REACT_APP_TOKENFACTORY_ADDRESSES ||
        !process.env.REACT_APP_GOVERNORFACTORY_ADDRESSES ||
        !process.env.REACT_APP_CLAIMFACTORY_ADDRESS ||
        !process.env.REACT_APP_GNOSISWRAPPERFACTORY_ADDRESS ||
        !process.env.REACT_APP_GNOSISSAFEFACTORY_ADDRESS ||
        !process.env.REACT_APP_DAO_ADDRESSES ||
        !process.env.REACT_APP_ACCESSCONTROL_ADDRESSES ||
        !process.env.REACT_APP_TREASURYMODULE_ADDRESSES ||
        !process.env.REACT_APP_GOVERNORMODULE_ADDRESSES ||
        !process.env.REACT_APP_TIMELOCK_ADDRESSES ||
        !process.env.REACT_APP_CLAIM_ADDRESS ||
        !process.env.REACT_APP_GNOSISWRAPPER_ADDRESS ||
        !process.env.REACT_APP_GNOSISSAFE_ADDRESS
      ) {
        console.error('Addresses not set!');
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
        process.env.REACT_APP_CLAIMFACTORY_ADDRESS
      );
      const gnosisWrapperFactoryNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_GNOSISWRAPPERFACTORY_ADDRESS);
      const gnosisSafeFactoryNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_GNOSISSAFEFACTORY_ADDRESS);
      const daoNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
        process.env.REACT_APP_DAO_ADDRESSES
      );
      const accessControlNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_ACCESSCONTROL_ADDRESSES);
      const treasuryModuleNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_TREASURYMODULE_ADDRESSES);
      const governorModuleNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_GOVERNORMODULE_ADDRESSES);
      const timelockNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
        process.env.REACT_APP_TIMELOCK_ADDRESSES
      );
      const claimModuleNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
        process.env.REACT_APP_CLAIM_ADDRESS
      );
      const gnosisWrapperNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_GNOSISWRAPPER_ADDRESS);
      const gnosisSafeNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
        process.env.REACT_APP_GNOSISSAFE_ADDRESS
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
        !gnosisSafeAddress
      ) {
        console.error(`At least one address for network ${chainId} is not set!`);
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
      });
    }
  }, [chainId]);

  return addresses;
}
