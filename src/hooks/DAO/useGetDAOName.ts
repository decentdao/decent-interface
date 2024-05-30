import { useCallback, useEffect, useState } from 'react';
import { Address, PublicClient, getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import FractalRegistryAbi from '../../assets/abi/FractalRegistry';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { createAccountSubstring } from '../utils/useDisplayName';

const getDAOName = async ({
  address,
  registryName,
  publicClient,
  fractalRegistry,
}: {
  address: Address;
  registryName?: string | null;
  publicClient: PublicClient | undefined;
  fractalRegistry: Address;
}) => {
  if (!publicClient) {
    throw new Error('Public client not available');
  }

  const ensName = await publicClient.getEnsName({ address: address }).catch((error: Error) => {
    if (error.name === 'ChainDoesNotSupportContract') {
      // Sliently fail, this is fine.
      // https://github.com/wevm/viem/discussions/781
    } else {
      throw error;
    }
  });
  if (ensName) {
    return ensName;
  }

  if (registryName) {
    return registryName;
  }

  const fractalRegistryContract = getContract({
    abi: FractalRegistryAbi,
    address: fractalRegistry,
    client: publicClient,
  });

  const events = await fractalRegistryContract.getEvents.FractalNameUpdated({
    daoAddress: getAddress(address),
  });

  const latestEvent = events.pop();
  if (latestEvent && latestEvent.args.daoName) {
    return latestEvent.args.daoName;
  }

  return createAccountSubstring(address);
};

const useGetDAOName = ({
  address,
  registryName,
}: {
  address: Address;
  registryName?: string | null;
}) => {
  const publicClient = usePublicClient();
  const {
    contracts: { fractalRegistry },
  } = useNetworkConfig();

  const [daoName, setDaoName] = useState<string>();
  useEffect(() => {
    getDAOName({ address, registryName, publicClient, fractalRegistry }).then(name => {
      setDaoName(name);
    });
  }, [address, publicClient, registryName, fractalRegistry]);

  return { daoName };
};

const useGetDAONameDeferred = () => {
  const publicClient = usePublicClient();
  const {
    contracts: { fractalRegistry },
  } = useNetworkConfig();

  return {
    getDAOName: useCallback(
      ({ address, registryName }: { address: Address; registryName?: string | null }) =>
        getDAOName({ address, registryName, publicClient, fractalRegistry }),
      [publicClient, fractalRegistry],
    ),
  };
};

export { useGetDAOName, useGetDAONameDeferred };
