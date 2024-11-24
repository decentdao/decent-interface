import { abis } from '@fractal-framework/fractal-contracts';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Address, GetContractEventsReturnType, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { logError } from '../../helpers/errorLogging';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { useRolesStore } from '../../store/roles/useRolesStore';

const getHatsTreeId = (
  events: GetContractEventsReturnType<typeof abis.KeyValuePairs> | undefined,
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

const getHatIdsToStreamIds = (
  events: GetContractEventsReturnType<typeof abis.KeyValuePairs> | undefined,
  sablierV2LockupLinear: Address,
  chainId: number,
) => {
  if (!events) {
    return [];
  }

  const hatIdToStreamIdEvents = events.filter(
    event => event.args.key && event.args.key === 'hatIdToStreamId',
  );

  const hatIdIdsToStreamIds = [];
  for (const event of hatIdToStreamIdEvents) {
    const hatIdToStreamId = event.args.value;
    if (hatIdToStreamId !== undefined) {
      const [hatId, streamId] = hatIdToStreamId.split(':');
      hatIdIdsToStreamIds.push({
        hatId: BigInt(hatId),
        streamId: `${sablierV2LockupLinear.toLowerCase()}-${chainId}-${streamId}`,
      });
      continue;
    }
    logError({
      message: "KVPairs 'hatIdToStreamId' without a value",
      network: chainId,
      args: {
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
      },
    });
  }
  return hatIdIdsToStreamIds;
};

const useKeyValuePairs = () => {
  const publicClient = usePublicClient();
  const node = useDaoInfoStore();
  const {
    chain,
    contracts: { keyValuePairs, sablierV2LockupLinear },
  } = useNetworkConfig();
  const { setHatsTreeId, setStreamIdsToHatIds } = useRolesStore();
  const [searchParams] = useSearchParams();

  const safeAddress = node.safe?.address;

  useEffect(() => {
    const safeParam = searchParams.get('dao');

    if (!publicClient || !safeAddress || safeAddress !== safeParam?.split(':')[1]) {
      return;
    }

    const keyValuePairsContract = getContract({
      abi: abis.KeyValuePairs,
      address: keyValuePairs,
      client: publicClient,
    });
    keyValuePairsContract.getEvents
      .ValueUpdated({ theAddress: safeAddress }, { fromBlock: 0n })
      .then(safeEvents => {
        setHatsTreeId({
          contextChainId: chain.id,
          hatsTreeId: getHatsTreeId(safeEvents, chain.id),
        });
        setStreamIdsToHatIds(getHatIdsToStreamIds(safeEvents, sablierV2LockupLinear, chain.id));
      })
      .catch(error => {
        setHatsTreeId({ hatsTreeId: null, contextChainId: chain.id });
        logError(error);
      });

    const unwatch = keyValuePairsContract.watchEvent.ValueUpdated(
      {
        theAddress: safeAddress,
      },
      {
        onLogs: logs => {
          // dev: when this event is captured in realtime, give the subgraph
          // time to index, and do that most cleanly by not even telling the rest
          // of our code that we have the hats tree id until some time has passed.
          setTimeout(() => {
            setHatsTreeId({
              hatsTreeId: getHatsTreeId(logs, chain.id),
              contextChainId: chain.id,
            });
            setStreamIdsToHatIds(getHatIdsToStreamIds(logs, sablierV2LockupLinear, chain.id));
          }, 20_000);
        },
      },
    );
    return () => {
      unwatch();
    };
  }, [
    chain.id,
    keyValuePairs,
    safeAddress,
    publicClient,
    searchParams,
    setHatsTreeId,
    setStreamIdsToHatIds,
    sablierV2LockupLinear,
  ]);
};

export { useKeyValuePairs };
