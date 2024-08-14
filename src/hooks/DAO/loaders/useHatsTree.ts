import { useApolloClient } from '@apollo/client';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { Tree, HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { intervalToDuration } from 'date-fns';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAddress, hexToBigInt } from 'viem';
import { usePublicClient } from 'wagmi';
import { StreamsQueryDocument } from '../../../../.graphclient';
import { SablierPayment } from '../../../components/pages/Roles/types';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore, DecentHatsError } from '../../../store/roles';
import { CacheExpiry, CacheKeys } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';

const hatsSubgraphClient = new HatsSubgraphClient({
  // TODO config for prod
});

function convertDuration(_duration: number): { years: number; days: number; hours: number } {
  let duration = (_duration ?? 0) * 1000;
  const millisecondsInAnHour = 1000 * 60 * 60;
  const millisecondsInADay = millisecondsInAnHour * 24;
  const millisecondsInAYear = millisecondsInADay * 365; // Approximation, does not account for leap years

  const years = Math.floor(duration / millisecondsInAYear);
  duration -= years * millisecondsInAYear;

  const days = Math.floor(duration / millisecondsInADay);
  duration -= days * millisecondsInADay;

  const hours = Math.floor(duration / millisecondsInAnHour);

  return {
    years,
    days,
    hours,
  };
}

const useHatsTree = () => {
  const { hatsTreeId, hatsTree, streamsFetched, setHatsTree, updateRolesWithStreams } =
    useRolesStore();

  console.log({
    hatsTreeId,
    hatsTree,
    streamsFetched,
  });

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
          const firstHatId = treeWithFetchedDetails.hats?.at(0)?.id;
          const fetchedHatsTreeId = !!firstHatId
            ? hatIdToTreeId(hexToBigInt(firstHatId))
            : undefined;

          console.log('in tree load');
          console.log({ fetchedHatsTreeId, hatsTreeId, treeWithFetchedDetails });

          if (fetchedHatsTreeId !== hatsTreeId) {
            console.log('Hats Tree ID does not match the fetched Hats Tree ID');
            return;
          }

          // console.log('treeWithFetchedDetails', treeWithFetchedDetails.hats);
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
          console.log('error in tree load', e);
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
      if (hatsTreeId === undefined || hatsTreeId === null) {
        return;
      }

      const firstHatId = hatsTree?.roleHats?.at(0)?.id;
      const fetchedHatsTreeId = !!firstHatId ? hatIdToTreeId(hexToBigInt(firstHatId)) : undefined;

      console.log('in payments');
      console.log({ fetchedHatsTreeId, hatsTreeId });

      if (fetchedHatsTreeId !== hatsTreeId) {
        console.log('Hats Tree ID does not match the fetched Hats Tree ID');
        return;
      }

      if (sablierSubgraph && hatsTree && hatsTree.roleHats.length > 0 && !streamsFetched) {
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

              const activeStreams = streamQueryResult.data.streams.filter(
                stream =>
                  parseInt(stream.endTime) <= Date.now() / 1000 ||
                  BigInt(stream.withdrawnAmount) !== BigInt(stream.intactAmount),
              );

              const lockupLinearStreams = activeStreams.filter(
                stream => stream.category === 'LockupLinear',
              );
              const formattedActiveStreams: SablierPayment[] = lockupLinearStreams.map(
                lockupLinearStream => {
                  const parsedAmount =
                    BigInt(lockupLinearStream.depositAmount) /
                    10n ** BigInt(lockupLinearStream.asset.decimals);
                  const cliffDuration = lockupLinearStream.cliff
                    ? (() => {
                        const duration = intervalToDuration({
                          start: secondsTimestampToDate(lockupLinearStream.startTime),
                          end: secondsTimestampToDate(lockupLinearStream.cliffTime),
                        });
                        return {
                          years: duration.years || 0,
                          days: duration.days || 0,
                          hours: duration.hours || 0,
                        };
                      })()
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
                      bigintValue: lockupLinearStream.depositAmount,
                      value: parsedAmount.toString(),
                    },
                    scheduleFixedDate: {
                      startDate: secondsTimestampToDate(lockupLinearStream.startTime),
                      endDate: secondsTimestampToDate(lockupLinearStream.endTime),
                      cliffDate: lockupLinearStream.cliff
                        ? secondsTimestampToDate(lockupLinearStream.cliffTime)
                        : undefined,
                    },
                    scheduleDuration: {
                      duration: convertDuration(lockupLinearStream.duration),
                      cliffDuration,
                    },
                    scheduleType: 'duration',
                  };
                },
              );

              return { ...hat, payments: formattedActiveStreams };
            } else {
              return hat;
            }
          }),
        );

        updateRolesWithStreams(updatedHatsRoles);
      }
    }

    getHatsStreams();
  }, [apolloClient, hatsTree, sablierSubgraph, updateRolesWithStreams, streamsFetched, hatsTreeId]);
};

export { useHatsTree };
