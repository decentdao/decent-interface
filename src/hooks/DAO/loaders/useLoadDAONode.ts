import { useLazyQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useCallback } from 'react';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalNode, Node, WithError } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

export const useLoadDAONode = () => {
  const safeAPI = useSafeAPI();
  const { getDaoName } = useLazyDAOName();
  const lookupModules = useFractalModules();
  const { subgraphChainName } = useNetworkConfig();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: { chainName: subgraphChainName },
  });

  const formatDAOQuery = useCallback((result: { data?: DAOQueryQuery }, _daoAddress: string) => {
    if (!result.data) {
      return;
    }
    const { daos } = result.data;
    const dao = daos[0];
    if (dao) {
      const { parentAddress, name, hierarchy, snapshotURL } = dao;

      const currentNode: Node = {
        nodeHierarchy: {
          parentAddress: parentAddress as string,
          childNodes: mapChildNodes(hierarchy),
        },
        daoName: name as string,
        daoAddress: utils.getAddress(_daoAddress as string),
        daoSnapshotURL: snapshotURL as string,
      };
      return currentNode;
    }
    return;
  }, []);

  const loadDao = useCallback(
    async (_daoAddress: string): Promise<FractalNode | WithError> => {
      if (utils.isAddress(_daoAddress) && safeAPI) {
        try {
          const graphNodeInfo = formatDAOQuery(
            await getDAOInfo({ variables: { daoAddress: _daoAddress } }),
            _daoAddress,
          );
          if (!graphNodeInfo) {
            logError('graphQL query failed');
            return { error: 'errorFailedSearch' };
          }

          const safeInfo = await safeAPI.getSafeInfo(_daoAddress);
          let nextNonce = safeInfo.nonce;
          const pendingTransactions = await safeAPI.getPendingTransactions(_daoAddress);
          if (pendingTransactions.count > 0) {
            nextNonce = Math.max(...pendingTransactions.results.map(tx => tx.nonce)) + 1;
          }
          const safeInfoWithGuard = { ...safeInfo, nonce: nextNonce };

          const fractalModules = await lookupModules(safeInfo.modules);
          const daoName = await getDaoName(
            utils.getAddress(safeInfo.address),
            graphNodeInfo.daoName,
          );

          const node: FractalNode = Object.assign(graphNodeInfo, {
            daoName,
            safe: safeInfoWithGuard,
            fractalModules,
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
    [safeAPI, lookupModules, formatDAOQuery, getDAOInfo, getDaoName],
  );

  return { loadDao };
};
