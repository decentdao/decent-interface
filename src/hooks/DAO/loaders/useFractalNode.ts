import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAddress } from 'viem';
import { DAO, DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../../providers/App/node/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../store/roles';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useGetDAONameDeferred } from '../useGetDAOName';
import { loadDemoData } from './loadDemoData';
import { useFractalModules } from './useFractalModules';

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = (
  skip: boolean,
  {
    addressPrefix,
    safeAddress,
  }: {
    addressPrefix?: string;
    safeAddress?: string;
  },
) => {
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const { action } = useFractal();
  const safeAPI = useSafeAPI();
  const { getDAOName } = useGetDAONameDeferred();

  const lookupModules = useFractalModules();

  const networkConfig = useNetworkConfig();
  const { resetHatsStore } = useRolesStore();

  const formatDAOQuery = useCallback(
    (result: { data?: DAOQueryQuery }) => {
      if (!safeAddress) return;
      const demo = loadDemoData(networkConfig.chain, getAddress(safeAddress), result);
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
          address: getAddress(safeAddress),
          daoSnapshotENS: snapshotENS as string,
          proposalTemplatesHash: proposalTemplatesHash as string,
        };
        return currentNode;
      }
      return;
    },
    [networkConfig.chain, safeAddress],
  );

  const { subgraph } = useNetworkConfig();

  useQuery(DAOQueryDocument, {
    variables: { safeAddress },
    onCompleted: async data => {
      if (!safeAddress) return;
      const graphNodeInfo = formatDAOQuery({ data });
      const daoName = await getDAOName({
        address: getAddress(safeAddress),
        registryName: graphNodeInfo?.daoName,
      });

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
      resetHatsStore();
      setErrorLoading(error);
    },
    [action, resetHatsStore],
  );

  const setDAO = useCallback(async () => {
    if (addressPrefix && safeAddress) {
      console.log('setDAO', safeAddress);

      currentValidSafe.current = addressPrefix + safeAddress;
      setErrorLoading(false);

      let safeInfo;

      try {
        if (!safeAPI) throw new Error('SafeAPI not set');
        const address = getAddress(safeAddress);
        safeInfo = await safeAPI.getSafeData(address);
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
      skip ||
      addressPrefix === undefined ||
      safeAddress === undefined ||
      addressPrefix + safeAddress !== currentValidSafe.current
    ) {
      console.count('reset hats store from useFractalNode because:');
      console.log({ skip, currentValidSafe: currentValidSafe.current, safeAddress });
      reset({ error: false });
      setDAO();
    }
  }, [addressPrefix, safeAddress, setDAO, reset, skip]);

  return { errorLoading };
};
