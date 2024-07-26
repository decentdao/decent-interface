import { useApolloClient } from '@apollo/client';
import { Tree, HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { StreamsQueryDocument } from '../../../../.graphclient';
import { SablierPayment } from '../../../components/pages/Roles/types';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentHatsError, useRolesState } from '../../../state/useRolesState';
import { CacheExpiry, CacheKeys } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';

const hatsSubgraphClient = new HatsSubgraphClient({
  // TODO config for prod
});

const useHatsTree = () => {
  const { hatsTreeId, hatsTree, streamsFetched, setHatsTree, setHatsStreams } = useRolesState();
  const ipfsClient = useIPFSClient();
  const {
    chain,
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
        decentHatsMasterCopy === undefined
      ) {
        return;
      }

      try {
        const tree = await hatsSubgraphClient.getTree({
          chainId: chain.id,
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
              chainId: chain.id,
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
            chainId: BigInt(chain.id),
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
          chainId: BigInt(chain.id),
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
            network: chain.id,
            hatsTreeId,
          },
        });
      }
    }

    getHatsTree();
  }, [
    chain.id,
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
      if (sablierSubgraph && hatsTree && hatsTree.roleHats.length > 0 && !streamsFetched) {
        const secondsTimestampToDate = (ts: string) => new Date(Number(ts) * 1000);
        const updatedHatsRoles = await Promise.all(
          hatsTree.roleHats.map(async hat => {
            if (hat.vesting) {
              return hat;
            }
            const streamQueryResult = await apolloClient.query({
              query: StreamsQueryDocument,
              variables: { recipientAddress: hat.smartAddress },
              context: { subgraphSpace: sablierSubgraph.space, subgraphSlug: sablierSubgraph.slug },
            });

            if (!streamQueryResult.error) {
              let vesting: SablierPayment | undefined;

              if (!streamQueryResult.data.streams.length) {
                return hat;
              }

              const activeStreams = streamQueryResult.data.streams.filter(
                stream =>
                  parseInt(stream.endTime) <= Date.now() / 1000 ||
                  BigInt(stream.withdrawnAmount) !== BigInt(stream.intactAmount),
              );

              const activeVestingStream = activeStreams.find(
                stream => stream.category === 'LockupLinear',
              );

              if (activeVestingStream) {
                const bigintAmount =
                  BigInt(activeVestingStream.depositAmount) /
                  10n ** BigInt(activeVestingStream.asset.decimals);
                vesting = {
                  streamId: activeVestingStream.id,
                  contractAddress: activeVestingStream.contract.address,
                  asset: {
                    address: getAddress(
                      activeVestingStream.asset.address,
                      activeVestingStream.asset.chainId,
                    ),
                    name: activeVestingStream.asset.name,
                    symbol: activeVestingStream.asset.symbol,
                    decimals: activeVestingStream.asset.decimals,
                    logo: '', // @todo - how do we get logo?
                  },
                  amount: {
                    bigintValue: bigintAmount,
                    value: bigintAmount.toString(),
                  },
                  scheduleFixedDate: {
                    startDate: secondsTimestampToDate(activeVestingStream.startTime),
                    endDate: secondsTimestampToDate(activeVestingStream.endTime),
                  },
                  // @dev We can't recover which UI element was used during initial stream creation
                  scheduleType: 'fixedDate',
                };
              }

              return { ...hat, vesting };
            } else {
              return hat;
            }
          }),
        );

        const updatedDecentTree = {
          ...hatsTree,
          roleHats: updatedHatsRoles,
        };

        setHatsStreams(updatedDecentTree);
      }
    }

    getHatsStreams();
  }, [apolloClient, hatsTree, sablierSubgraph, setHatsStreams, streamsFetched]);
};

export { useHatsTree };
