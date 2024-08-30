import { useApolloClient } from '@apollo/client';
import { HatsSubgraphClient, Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { formatUnits, getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { StreamsQueryDocument } from '../../../../.graphclient';
import { SablierV2LockupLinearAbi } from '../../../assets/abi/SablierV2LockupLinear';
import { SablierPayment } from '../../../components/pages/Roles/types';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentHatsError, useRolesStore } from '../../../store/roles';
import { convertStreamIdToBigInt } from '../../streams/useCreateSablierStream';
import { CacheExpiry, CacheKeys } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';

const hatsSubgraphClient = new HatsSubgraphClient({
  // TODO config for prod
});

const useHatsTree = () => {
  const {
    hatsTreeId,
    contextChainId,
    hatsTree,
    streamsFetched,
    setHatsTree,
    updateRolesWithStreams,
  } = useRolesStore();

  const ipfsClient = useIPFSClient();
  const {
    sablierSubgraph,
    contracts: {
      hatsProtocol,
      erc6551Registry,
      hatsAccount1ofNMasterCopy: hatsAccountImplementation,
      decentHatsMasterCopy,
    },
  } = useNetworkConfig();
  const publicClient = usePublicClient();
  const apolloClient = useApolloClient();

  useEffect(() => {
    async function getHatsTree() {
      if (
        hatsTreeId === undefined ||
        hatsTreeId === null ||
        publicClient === undefined ||
        decentHatsMasterCopy === undefined ||
        contextChainId === null
      ) {
        return;
      }

      try {
        const tree = await hatsSubgraphClient.getTree({
          chainId: contextChainId,
          treeId: hatsTreeId,
          props: {
            hats: {
              props: {
                prettyId: true,
                status: true,
                details: true,
                wearers: {
                  props: {},
                },
              },
            },
          },
        });

        const hatsWithFetchedDetails = await Promise.all(
          (tree.hats || []).map(async hat => {
            const ipfsPrefix = 'ipfs://';

            if (hat.details === undefined || !hat.details.startsWith(ipfsPrefix)) {
              return hat;
            }

            const hash = hat.details.split(ipfsPrefix)[1];
            const cacheKey = {
              cacheName: CacheKeys.IPFS_HASH,
              hash,
              chainId: contextChainId,
            } as const;

            const cachedDetails = getValue(cacheKey);

            if (cachedDetails) {
              return { ...hat, details: cachedDetails };
            }

            try {
              const detailsFromIpfs = await ipfsClient.cat(hash);
              const jsonStringDetails = JSON.stringify(detailsFromIpfs);
              setValue(cacheKey, jsonStringDetails, CacheExpiry.NEVER);
              return { ...hat, details: jsonStringDetails };
            } catch {
              return hat;
            }
          }),
        );

        const treeWithFetchedDetails: Tree = { ...tree, hats: hatsWithFetchedDetails };
        try {
          await setHatsTree({
            hatsTree: treeWithFetchedDetails,
            chainId: BigInt(contextChainId),
            hatsProtocol: hatsProtocol,
            erc6551Registry,
            hatsAccountImplementation,
            publicClient,
            decentHats: getAddress(decentHatsMasterCopy),
          });
        } catch (e) {
          if (e instanceof DecentHatsError) {
            toast(e.message);
          }
        }
      } catch (e) {
        setHatsTree({
          hatsTree: null,
          chainId: BigInt(contextChainId),
          hatsProtocol: hatsProtocol,
          erc6551Registry,
          hatsAccountImplementation,
          publicClient,
          decentHats: getAddress(decentHatsMasterCopy),
        });
        const message = 'Hats Tree ID is not valid';
        toast(message);
        console.error(e, {
          message,
          args: {
            network: contextChainId,
            hatsTreeId,
          },
        });
      }
    }

    getHatsTree();
  }, [
    contextChainId,
    decentHatsMasterCopy,
    erc6551Registry,
    hatsAccountImplementation,
    hatsProtocol,
    hatsTreeId,
    ipfsClient,
    publicClient,
    setHatsTree,
  ]);

  useEffect(() => {
    async function getHatsStreams() {
      if (
        sablierSubgraph &&
        hatsTree &&
        hatsTree.roleHats.length > 0 &&
        !streamsFetched &&
        publicClient
      ) {
        const secondsTimestampToDate = (ts: string) => new Date(Number(ts) * 1000);
        const updatedHatsRoles = await Promise.all(
          hatsTree.roleHats.map(async hat => {
            // @todo role | check logic
            if (hat.payments?.length) {
              return hat;
            }
            const streamQueryResult = await apolloClient.query({
              query: StreamsQueryDocument,
              variables: { recipientAddress: hat.smartAddress },
              context: { subgraphSpace: sablierSubgraph.space, subgraphSlug: sablierSubgraph.slug },
            });

            if (!streamQueryResult.error) {
              if (!streamQueryResult.data.streams.length) {
                return hat;
              }

              const lockupLinearStreams = streamQueryResult.data.streams.filter(
                stream => stream.category === 'LockupLinear',
              );
              const formattedLinearStreams = lockupLinearStreams.map(lockupLinearStream => {
                const parsedAmount = formatUnits(
                  BigInt(lockupLinearStream.depositAmount),
                  lockupLinearStream.asset.decimals,
                );

                const startDate = secondsTimestampToDate(lockupLinearStream.startTime);
                const endDate = secondsTimestampToDate(lockupLinearStream.endTime);
                const cliffDate = lockupLinearStream.cliff
                  ? secondsTimestampToDate(lockupLinearStream.cliffTime)
                  : undefined;

                return {
                  streamId: lockupLinearStream.id,
                  contractAddress: lockupLinearStream.contract.address,
                  asset: {
                    address: getAddress(
                      lockupLinearStream.asset.address,
                      lockupLinearStream.asset.chainId,
                    ),
                    name: lockupLinearStream.asset.name,
                    symbol: lockupLinearStream.asset.symbol,
                    decimals: lockupLinearStream.asset.decimals,
                    logo: '', // @todo - how do we get logo?
                  },
                  amount: {
                    bigintValue: BigInt(lockupLinearStream.depositAmount),
                    value: parsedAmount,
                  },
                  startDate,
                  endDate,
                  cliffDate,
                  isStreaming: () => {
                    const start = !lockupLinearStream.cliff
                      ? startDate.getTime()
                      : cliffDate !== undefined
                        ? cliffDate.getTime()
                        : undefined;
                    const end = endDate ? endDate.getTime() : undefined;
                    const cancelled = lockupLinearStream.canceled;
                    const now = new Date().getTime();

                    return !cancelled && !!start && !!end && start <= now && end > now;
                  },
                };
              });

              const streamsWithCurrentWithdrawableAmounts: SablierPayment[] = await Promise.all(
                formattedLinearStreams.map(async stream => {
                  const streamContract = getContract({
                    abi: SablierV2LockupLinearAbi,
                    address: stream.contractAddress,
                    client: publicClient,
                  });
                  const bigintStreamId = convertStreamIdToBigInt(stream.streamId);

                  const newWithdrawableAmount = await streamContract.read.withdrawableAmountOf([
                    bigintStreamId,
                  ]);
                  return { ...stream, withdrawableAmount: newWithdrawableAmount };
                }),
              );

              return { ...hat, payments: streamsWithCurrentWithdrawableAmounts };
            } else {
              return hat;
            }
          }),
        );

        updateRolesWithStreams(updatedHatsRoles);
      }
    }

    getHatsStreams();
  }, [
    apolloClient,
    hatsTree,
    sablierSubgraph,
    updateRolesWithStreams,
    streamsFetched,
    publicClient,
  ]);
};

export { useHatsTree };
