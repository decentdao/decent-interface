import { useLazyQuery } from '@apollo/client';
import { useCallback } from 'react';
import { Address, getAddress, isAddress } from 'viem';
import { DAO, DAOQueryDocument } from '../../../../.graphclient';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DaoInfo } from '../../../types';
import { useGetSafeName } from '../../utils/useGetSafeName';
import { useFractalModules } from './useFractalModules';

type DAOInfoWithoutLoaders = Omit<DaoInfo, 'isModulesLoaded' | 'isHierarchyLoaded'>;

export const useLoadDAONode = () => {
  const safeAPI = useSafeAPI();
  const { getSafeName } = useGetSafeName();
  const lookupModules = useFractalModules();
  const { subgraph } = useNetworkConfig();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

  const getDAOWithHierarchyData = useCallback(
    async (dao: DAO) => {
      const childData: DAOInfoWithoutLoaders[] = [];
      for await (const child of dao.hierarchy) {
        const safe = await safeAPI.getSafeData(getAddress(child.address));
        childData.push({
          fractalModules: [],
          safe: safe,
          nodeHierarchy: {
            parentAddress: isAddress(child.parentAddress) ? getAddress(child.parentAddress) : null,
            childNodes: await getDAOWithHierarchyData(child),
          },
          daoName: child.name ?? null,
          daoSnapshotENS: child.snapshotENS ?? undefined,
        });
      }
      return childData;
    },
    [safeAPI],
  );

  const loadDao = useCallback(
    async (safeAddress: Address): Promise<DaoInfo> => {
      if (safeAPI) {
        try {
          const graphRawNodeData = await getDAOInfo({ variables: { safeAddress } });
          const graphDAOData = graphRawNodeData.data?.daos[0];
          if (!graphRawNodeData || !graphDAOData) {
            throw new Error('No data found');
          }
          const currentSafe = await safeAPI.getSafeData(safeAddress);
          const daoWithHierarchyData: DAOInfoWithoutLoaders = {
            fractalModules: await lookupModules(currentSafe.modules),
            safe: currentSafe,
            nodeHierarchy: {
              parentAddress: isAddress(graphDAOData.parentAddress)
                ? getAddress(graphDAOData.parentAddress)
                : null,
              childNodes: await getDAOWithHierarchyData(graphDAOData),
            },
            daoName: graphDAOData.name ?? (await getSafeName(currentSafe.address)),
            daoSnapshotENS:
              graphDAOData.snapshotENS === null || graphDAOData.snapshotENS === undefined
                ? undefined
                : graphDAOData.snapshotENS,
          };
          return daoWithHierarchyData;
        } catch (e) {
          // @note There is a recurring error (AbortError: signal is aborted without reason)
          // related to the getDAOInfo query. This error does not seem to affect the app's functionality.
          throw new Error('Error loading DAO');
        }
      } else {
        throw new Error('SafeAPI not set');
      }
    },
    [getDAOInfo, getDAOWithHierarchyData, getSafeName, lookupModules, safeAPI],
  );

  return { loadDao };
};
