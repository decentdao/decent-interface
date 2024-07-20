import { useApolloClient } from '@apollo/client';
import { Tree, HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { StreamsQueryDocument } from '../../../../.graphclient';
import { Frequency, SablierPayroll, SablierVesting } from '../../../components/pages/Roles/types';
import { SECONDS_IN_DAY } from '../../../constants/common';
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
            if (hat.payroll || hat.vesting) {
              return hat;
            }
            const streamQueryResult = await apolloClient.query({
              query: StreamsQueryDocument,
              variables: { recipientAddress: hat.smartAddress },
              context: { subgraphSpace: sablierSubgraph.space, subgraphSlug: sablierSubgraph.slug },
            });

            if (!streamQueryResult.error) {
              let payroll: SablierPayroll | undefined;
              let vesting: SablierVesting | undefined;

              if (!streamQueryResult.data.streams.length) {
                return hat;
              }

              const activeStreams = streamQueryResult.data.streams.filter(
                stream =>
                  parseInt(stream.endTime) <= Date.now() / 1000 ||
                  BigInt(stream.withdrawnAmount) !== BigInt(stream.intactAmount),
              );

              const activePayrollStream = activeStreams.find(
                stream => stream.category === 'LockupTranched',
              );

              const activeVestingStream = activeStreams.find(
                stream => stream.category === 'LockupLinear',
              );

              if (activePayrollStream) {
                const firstActualTranche = activePayrollStream.tranches.find(
                  tranche => BigInt(tranche.startAmount) === 0n && BigInt(tranche.endAmount) > 0n,
                );
                // @dev - Tranched stream without tranche that has endAmount bigger than 0 doesn't make any sense
                // But to prevent weird UI collisions - we simply won't process that
                if (firstActualTranche) {
                  let paymentFrequency: Frequency = Frequency.Monthly;
                  const trancheDuration =
                    Number(firstActualTranche.endTime) - Number(firstActualTranche.startTime);

                  if (trancheDuration === SECONDS_IN_DAY * 7) {
                    paymentFrequency = Frequency.Weekly;
                  } else if (trancheDuration === SECONDS_IN_DAY * 14) {
                    paymentFrequency = Frequency.EveryTwoWeeks;
                  }

                  const bigintAmount =
                    BigInt(firstActualTranche.amount) /
                    10n ** BigInt(activePayrollStream.asset.decimals);
                  payroll = {
                    asset: {
                      address: getAddress(
                        activePayrollStream.asset.address,
                        activePayrollStream.asset.chainId,
                      ),
                      name: activePayrollStream.asset.name,
                      symbol: activePayrollStream.asset.symbol,
                      decimals: activePayrollStream.asset.decimals,
                      logo: '', // @todo - how do we get logo?
                    },
                    amount: {
                      bigintValue: bigintAmount,
                      value: bigintAmount.toString(),
                    },
                    // @dev Very first tranche is empty and it is used to delay actual start of a payroll till given date
                    paymentStartDate: secondsTimestampToDate(firstActualTranche.startTime),
                    // @dev And also we don't want to count that tranche towards paymentFrequencyNumber
                    paymentFrequencyNumber: activePayrollStream.tranches.length - 1,
                    paymentFrequency,
                  };
                }
              }

              if (activeVestingStream) {
                const bigintAmount =
                  BigInt(activeVestingStream.depositAmount) /
                  10n ** BigInt(activeVestingStream.asset.decimals);
                vesting = {
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
                  vestingAmount: {
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

              return { ...hat, payroll, vesting };
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

        console.log(updatedHatsRoles, updatedDecentTree);
      }
    }

    getHatsStreams();
  }, [apolloClient, hatsTree, sablierSubgraph, setHatsStreams, streamsFetched]);
};

export { useHatsTree };
