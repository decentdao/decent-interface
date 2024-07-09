import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEffect } from 'react';
import { GetContractEventsReturnType, getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import KeyValuePairsAbi from '../../assets/abi/KeyValuePairs';
import { logError } from '../../helpers/errorLogging';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../state/useRolesState';

const getHatsTreeId = (
  events: GetContractEventsReturnType<typeof KeyValuePairsAbi> | undefined,
  chainId: number,
) => {
  if (!events) {
    return null;
  }

  // get most recent event where `topHatId` was set
  const topHatIdEvent = events
    .filter(event => event.args.key && event.args.key === 'topHatId')
    .pop();

  if (!topHatIdEvent) {
    return null;
  }

  if (!topHatIdEvent.args.value) {
    logError({
      message: "KVPairs 'topHatIdEvent' without a value",
      network: chainId,
      args: {
        transactionHash: topHatIdEvent.transactionHash,
        logIndex: topHatIdEvent.logIndex,
      },
    });
    return undefined;
  }

  try {
    const topHatId = BigInt(topHatIdEvent.args.value);
    const treeId = hatIdToTreeId(topHatId);
    return treeId;
  } catch (e) {
    logError({
      message: "KVPairs 'topHatIdEvent' value not a number",
      network: chainId,
      args: {
        transactionHash: topHatIdEvent.transactionHash,
        logIndex: topHatIdEvent.logIndex,
      },
    });
    return undefined;
  }
};

const useKeyValuePairs = () => {
  const publicClient = usePublicClient();
  const { node } = useFractal();
  const {
    chain,
    contracts: { keyValuePairs },
  } = useNetworkConfig();
  const { setHatsTreeId } = useRolesState();

  useEffect(() => {
    if (!publicClient || !node.daoAddress) {
      return;
    }

    const keyValuePairsContract = getContract({
      abi: KeyValuePairsAbi,
      address: getAddress(keyValuePairs),
      client: publicClient,
    });
    keyValuePairsContract.getEvents
      .ValueUpdated({ theAddress: node.daoAddress }, { fromBlock: 0n })
      .then(safeEvents => setHatsTreeId(getHatsTreeId(safeEvents, chain.id)))
      .catch(error => {
        logError(error);
      });

    const unwatch = keyValuePairsContract.watchEvent.ValueUpdated(
      {
        theAddress: node.daoAddress,
      },
      {
        onLogs: logs => {
          // dev: when this event is captured in realtime, give the subgraph
          // time to index, and do that most cleanly by not even telling the rest
          // of our code that we have the hats tree id until some time has passed.
          setTimeout(() => {
            setHatsTreeId(getHatsTreeId(logs, chain.id));
          }, 10_000);
        },
      },
    );
    return () => {
      unwatch();
    };
  }, [chain.id, keyValuePairs, node.daoAddress, publicClient, setHatsTreeId]);
};

export { useKeyValuePairs };
