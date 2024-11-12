import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Address } from 'viem';
import { DAO, DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../../providers/App/node/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useGetSafeName } from '../../utils/useGetSafeName';
import { loadDemoData } from './loadDemoData';
import { useFractalModules } from './useFractalModules';

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = ({
  addressPrefix,
  safeAddress,
}: {
  addressPrefix?: string;
  safeAddress?: Address;
}) => {
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const { action } = useFractal();
  const safeAPI = useSafeAPI();
  const { getSafeName } = useGetSafeName();

  const lookupModules = useFractalModules();

  const { chain } = useNetworkConfig();

  const { subgraph } = useNetworkConfig();

  useQuery(DAOQueryDocument, {
    variables: { safeAddress },
    onCompleted: async data => {
      if (!safeAddress) return;

      const getNodeInfo = (result: { data?: DAOQueryQuery }) => {
        const demo = loadDemoData(chain, safeAddress, result);
        if (!demo.data) {
          return;
        }
        const { daos } = demo.data;
        const dao = daos[0];
        if (dao) {
          const { parentAddress, name, snapshotENS, proposalTemplatesHash } = dao;

          const currentNode: Node = {
            nodeHierarchy: {
              parentAddress,
              childNodes: mapChildNodes(dao as DAO),
            },
            daoName: name as string,
            address: safeAddress,
            daoSnapshotENS: snapshotENS as string,
            proposalTemplatesHash: proposalTemplatesHash as string,
          };
          return currentNode;
        }
        return;
      };

      const graphNodeInfo = getNodeInfo({ data });
      const daoName = graphNodeInfo?.daoName ?? (await getSafeName(safeAddress));

      action.dispatch({
        type: NodeAction.SET_DAO_INFO,
        payload: Object.assign(graphNodeInfo || {}, { daoName }),
      });
    },
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
    pollInterval: ONE_MINUTE,
  });

  const reset = useCallback(
    ({ error }: { error: boolean }) => {
      currentValidSafe.current = undefined;
      action.resetSafeState();
      setErrorLoading(error);
    },
    [action],
  );

  const setDAO = useCallback(async () => {
    if (addressPrefix && safeAddress) {
      currentValidSafe.current = `${addressPrefix}${safeAddress}`;
      setErrorLoading(false);

      let safeInfo;

      try {
        if (!safeAPI) throw new Error('SafeAPI not set');
        safeInfo = await safeAPI.getSafeData(safeAddress);
      } catch (e) {
        reset({ error: true });
        return;
      }

      // if here, we have a valid Safe!

      action.dispatch({
        type: NodeAction.SET_FRACTAL_MODULES,
        payload: await lookupModules(safeInfo.modules),
      });

      action.dispatch({
        type: NodeAction.SET_SAFE_INFO,
        payload: safeInfo,
      });
    }
  }, [action, lookupModules, reset, safeAPI, addressPrefix, safeAddress]);

  useEffect(() => {
    if (
      addressPrefix === undefined ||
      safeAddress === undefined ||
      `${addressPrefix}${safeAddress}` !== currentValidSafe.current
    ) {
      reset({ error: false });
      setDAO();
    }
  }, [addressPrefix, safeAddress, setDAO, reset]);

  return { errorLoading };
};
