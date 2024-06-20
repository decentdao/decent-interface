import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { RolesAction } from '../../../providers/App/roles/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useKeyValuePairs } from '../../../useKeyValuePairs';

const hatsSubgraphClient = new HatsSubgraphClient({
  // config for prod
});

const useHatsTree = () => {
  const publicClient = usePublicClient();
  const { action, node } = useFractal();
  const {
    chain,
    contracts: { keyValuePairs },
  } = useNetworkConfig();

  let { hatsTreeId } = useKeyValuePairs();

  useEffect(() => {
    (async () => {
      if (hatsTreeId === undefined) {
        return;
      }

      try {
        console.log(`fetching tree with id ${hatsTreeId}`);
        const tree = await hatsSubgraphClient.getTree({
          chainId: chain.id,
          treeId: hatsTreeId,
          props: {
            hats: {
              props: {
                prettyId: true,
                status: true,
                createdAt: true,
                details: true,
                maxSupply: true,
                eligibility: true,
                toggle: true,
                mutable: true,
                levelAtLocalTree: true,
                currentSupply: true,
              },
            },
          },
        });

        action.dispatch({
          type: RolesAction.SET_HATS_TREE,
          payload: tree,
        });
      } catch (e) {
        logError({
          message: 'hatsTreeId is not valid',
          args: {
            network: chain.id,
            hatsTreeId: hatsTreeId,
          },
        });
      }
    })();
  }, [node.daoAddress, publicClient, chain.id, action, keyValuePairs, hatsTreeId]);
};

export { useHatsTree };
