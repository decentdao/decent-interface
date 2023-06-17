import { useLazyQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useCallback } from 'react';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalNode, Node, WithError } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { CacheExpiry, CacheKeys } from '../../utils/cache/cacheDefaults';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

export const useLoadDAONode = () => {
  const {
    clients: { safeService },
  } = useFractal();
  const { getDaoName } = useLazyDAOName();
  const lookupModules = useFractalModules();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument);
  const { setValue, getValue } = useLocalStorage();

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
      const cached = getValue(CacheKeys.DAO_NODE_PREFIX + _daoAddress);
      if (cached) {
        return cached;
      }
      if (utils.isAddress(_daoAddress)) {
        try {
          const safe = await safeService.getSafeInfo(_daoAddress);
          const fractalModules = await lookupModules(safe.modules);
          const graphNodeInfo = formatDAOQuery(
            await getDAOInfo({ variables: { daoAddress: _daoAddress } }),
            safe.address
          );
          if (!graphNodeInfo) {
            logError('graphQL query failed');
            return { error: 'errorFailedSearch' };
          }
          const daoName = await getDaoName(utils.getAddress(safe.address), graphNodeInfo.daoName);

          const node: FractalNode = Object.assign(graphNodeInfo, {
            daoName,
            safe,
            fractalModules,
          });

          setValue(CacheKeys.DAO_NODE_PREFIX + _daoAddress, node, CacheExpiry.ONE_HOUR);

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
    [getValue, safeService, lookupModules, formatDAOQuery, getDAOInfo, getDaoName, setValue]
  );

  return { loadDao };
};
