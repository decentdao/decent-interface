import { useState, useEffect } from 'react';

const supportedChains = () => {
  const dev =
    process.env.NODE_ENV !== 'production'
      ? [parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID || '0')]
      : [];
  const supported = [
    ...dev,
    ...(process.env.REACT_APP_SUPPORTED_CHAIN_IDS || '').split(',').map(i => parseInt(i)),
  ];
  return supported;
};

const useAddresses = (chainId: number | undefined) => {
  const [addresses, setAddresses] = useState<{
    metaFactory?: { address: string };
    daoFactory?: { address: string };
    treasuryModuleFactory?: { address: string };
    tokenFactory?: { address: string };
    governorFactory?: { address: string };
    dao?: { address: string };
    accessControl?: { address: string };
    treasuryModule?: { address: string };
    governorModule?: { address: string };
    timelockUpgradeable?: { address: string };
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
        !process.env.REACT_APP_LOCAL_DAO_ADDRESS ||
        !process.env.REACT_APP_LOCAL_ACCESSCONTROL_ADDRESS ||
        !process.env.REACT_APP_LOCAL_TREASURYMODULE_ADDRESS ||
        !process.env.REACT_APP_LOCAL_GOVERNORMODULE_ADDRESS ||
        !process.env.REACT_APP_LOCAL_TIMELOCKUPGRADEABLE_ADDRESS
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
        dao: JSON.parse(process.env.REACT_APP_LOCAL_DAO_ADDRESS),
        accessControl: JSON.parse(process.env.REACT_APP_LOCAL_ACCESSCONTROL_ADDRESS),
        treasuryModule: JSON.parse(process.env.REACT_APP_LOCAL_TREASURYMODULE_ADDRESS),
        governorModule: JSON.parse(process.env.REACT_APP_LOCAL_GOVERNORMODULE_ADDRESS),
        timelockUpgradeable: JSON.parse(process.env.REACT_APP_LOCAL_TIMELOCKUPGRADEABLE_ADDRESS),
      });
    } else {
      if (
        !process.env.REACT_APP_METAFACTORY_ADDRESSES ||
        !process.env.REACT_APP_DAOFACTORY_ADDRESSES ||
        !process.env.REACT_APP_TREASURYMODULEFACTORY_ADDRESSES ||
        !process.env.REACT_APP_TOKENFACTORY_ADDRESSES ||
        !process.env.REACT_APP_GOVERNORFACTORY_ADDRESSES ||
        !process.env.REACT_APP_DAO_ADDRESSES ||
        !process.env.REACT_APP_ACCESSCONTROL_ADDRESSES ||
        !process.env.REACT_APP_TREASURYMODULE_ADDRESSES ||
        !process.env.REACT_APP_GOVERNORMODULE_ADDRESSES ||
        !process.env.REACT_APP_TIMELOCKUPGRADEABLE_ADDRESSES
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
      const daoNetworksAddresses: { [chaindId: number]: { address: string } } = JSON.parse(
        process.env.REACT_APP_DAO_ADDRESSES
      );
      const accessControlNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_ACCESSCONTROL_ADDRESSES);
      const treasuryModuleNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_TREASURYMODULE_ADDRESSES);
      const governorModuleNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_GOVERNORMODULE_ADDRESSES);
      const timelockUpgradeableNetworksAddresses: { [chaindId: number]: { address: string } } =
        JSON.parse(process.env.REACT_APP_TIMELOCKUPGRADEABLE_ADDRESSES);

      const metaFactoryAddress: { address: string } = metaFactoryNetworksAddresses[chainId];
      const daoFactoryAddress: { address: string } = daoFactoryNetworksAddresses[chainId];
      const treasuryModuleFactoryAddress: { address: string } =
        treasuryModuleFactoryNetworksAddresses[chainId];
      const tokenFactoryAddress: { address: string } = tokenFactoryNetworksAddresses[chainId];
      const governorFactoryAddress: { address: string } = governorFactoryNetworksAddresses[chainId];
      const daoAddress: { address: string } = daoNetworksAddresses[chainId];
      const accessControlAddress: { address: string } = accessControlNetworksAddresses[chainId];
      const treasuryModuleAddress: { address: string } = treasuryModuleNetworksAddresses[chainId];
      const governorModuleAddress: { address: string } = governorModuleNetworksAddresses[chainId];
      const timelockUpgradeableAddress: { address: string } =
        timelockUpgradeableNetworksAddresses[chainId];

      if (
        !metaFactoryAddress ||
        !daoFactoryAddress ||
        !treasuryModuleFactoryAddress ||
        !tokenFactoryAddress ||
        !governorFactoryAddress ||
        !daoAddress ||
        !accessControlAddress ||
        !treasuryModuleAddress ||
        !governorModuleAddress ||
        !timelockUpgradeableAddress
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
        dao: daoAddress,
        accessControl: accessControlAddress,
        treasuryModule: treasuryModuleAddress,
        governorModule: governorModuleAddress,
        timelockUpgradeable: timelockUpgradeableAddress,
      });
    }
  }, [chainId]);

  return addresses;
};

export { supportedChains, useAddresses };
