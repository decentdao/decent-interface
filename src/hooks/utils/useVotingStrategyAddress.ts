import { useEffect, useState } from 'react';
import { Address, getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../assets/abi/Azorius';
import { SENTINEL_ADDRESS } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { getAzoriusModuleFromModules } from '../../utils';

const useVotingStrategyAddress = () => {
  const [votingStrategyAddress, setVotingStrategyAddress] = useState<Address>();

  const { node } = useFractal();
  const publicClient = usePublicClient();

  useEffect(() => {
    const azoriusModule = getAzoriusModuleFromModules(node.fractalModules);

    if (!azoriusModule || !publicClient) {
      return;
    }

    const azoriusContract = getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusModule.moduleAddress),
      client: publicClient,
    });

    // @dev assumes the first strategy is the voting contract
    azoriusContract.read.getStrategies([SENTINEL_ADDRESS, 0n]).then(strategies => {
      setVotingStrategyAddress(strategies[1]);
    });
  }, [node.fractalModules, publicClient]);

  return votingStrategyAddress;
};

export default useVotingStrategyAddress;
