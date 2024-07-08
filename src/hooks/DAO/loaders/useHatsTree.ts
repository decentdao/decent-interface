import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentHatsError, useRolesState } from '../../../state/useRolesState';
import { CacheExpiry, CacheKeys } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';
import { useHatsSubgraphClient } from './useHatsSubgraphClient';

const useHatsTree = () => {
  const { hatsTreeId } = useRolesState();
  const { chain } = useNetworkConfig();
  const hatsSubgraphClient = useHatsSubgraphClient();
  const { setHatsTree } = useRolesState();
  const ipfsClient = useIPFSClient();

  useEffect(() => {
    async function getHatsTree() {
      if (hatsTreeId === undefined || hatsTreeId === null) {
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
          setHatsTree(treeWithFetchedDetails);
        } catch (e) {
          if (e instanceof DecentHatsError) {
            toast(e.message);
          }
        }
      } catch (e) {
        setHatsTree(undefined);
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
  }, [chain.id, hatsSubgraphClient, hatsTreeId, setHatsTree, ipfsClient]);
};

export { useHatsTree };
