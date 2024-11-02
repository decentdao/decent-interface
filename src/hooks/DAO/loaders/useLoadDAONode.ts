import { useLazyQuery } from '@apollo/client';
import { useCallback } from 'react';
import { isAddress, getAddress } from 'viem';
import { DAO, DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalNode, Node, WithError } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useGetSafeName } from '../../utils/useGetSafeName';
import { loadDemoData } from './loadDemoData';
import { useFractalModules } from './useFractalModules';

export const useLoadDAONode = () => {
  const safeAPI = useSafeAPI();
  const { getSafeName } = useGetSafeName();
  const lookupModules = useFractalModules();
  const { chain, subgraph } = useNetworkConfig();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

  const formatDAOQuery = useCallback(
    (result: { data?: DAOQueryQuery }, safeAddress: string) => {
      const demo = loadDemoData(chain, getAddress(safeAddress), result);
      if (!demo.data) {
        return;
      }
      const { daos } = demo.data;
      const dao = daos[0];
      if (dao) {
        const { parentAddress, name, snapshotENS } = dao;

        const currentNode: Node = {
          nodeHierarchy: {
            parentAddress,
            childNodes: mapChildNodes(dao as DAO),
          },
          daoName: name as string,
          address: getAddress(safeAddress),
          daoSnapshotENS: snapshotENS as string,
        };
        return currentNode;
      }
      return;
    },
    [chain],
  );

  const loadDao = useCallback(
    // Can't `safeAddress` safely be an `Address` type?
    async (safeAddress: string): Promise<FractalNode | WithError> => {
      if (isAddress(safeAddress) && safeAPI) {
        try {
          const graphNodeInfo = formatDAOQuery(
            await getDAOInfo({ variables: { safeAddress } }),
            safeAddress,
          );
          if (!graphNodeInfo) {
            logError('graphQL query failed');
            return { error: 'errorFailedSearch' };
          }

          // safeAPI.getSafeData expects a checksummed address here, so we gotta do getAddress,
          // even if `daoAddress` passes the isAddress check above
          const checksummedAddress = getAddress(safeAddress);
          const safeInfoWithGuard = await safeAPI.getSafeData(checksummedAddress);

          const node: FractalNode = Object.assign(graphNodeInfo, {
            daoName: graphNodeInfo.daoName ?? (await getSafeName(safeAddress)),
            safe: safeInfoWithGuard,
            fractalModules: await lookupModules(safeInfoWithGuard.modules),
          });

          // TODO we could cache node here, but should be careful not to cache
          // nodes that haven't fully loaded

          return node;
        } catch (e) {
          logError(e);
          return { error: 'errorInvalidSearch' };
        }
      } else {
        // invalid address
        return { error: 'errorFailedSearch' };
      }
    },
    [formatDAOQuery, getDAOInfo, getSafeName, lookupModules, safeAPI],
  );

  return { loadDao };
};
