import { useLazyQuery, useQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { BASE_ROUTES } from '../../../constants/routes';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { NodeAction } from '../../../providers/App/node/action';
import { FractalNode, Node, WithError } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

const mapChildNodes = (_hierarchy: any) => {
  return _hierarchy.map((node: any) => {
    return {
      nodeHierarchy: {
        parentAddress: node.parentAddress,
        childNodes: mapChildNodes(node.hierarchy),
      },
      daoName: node.name,
      daoAddress: node.address,
    };
  });
};

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = ({
  daoAddress,
  loadOnMount = true,
}: {
  daoAddress?: string;
  loadOnMount?: boolean;
}) => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | undefined>();
  const {
    clients: { safeService },
    action,
  } = useFractal();
  const { getDaoName } = useLazyDAOName();
  const { t } = useTranslation('dashboard');
  const { replace } = useRouter();

  const lookupModules = useFractalModules();
  const { setMethodOnInterval } = useUpdateTimer(currentValidAddress.current);
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument);

  const invalidateDAO = useCallback(
    (errorMessage: string) => {
      // invalid DAO
      toast(t(errorMessage), { toastId: 'invalid-dao' });
      action.resetDAO();
      replace(BASE_ROUTES.landing);
    },
    [action, replace, t]
  );

  const formatDAOQuery = useCallback((result: { data?: DAOQueryQuery }, _daoAddress: string) => {
    if (!result.data) {
      return;
    }
    const { daos } = result.data;
    const dao = daos[0];
    if (dao) {
      const { parentAddress, name, hierarchy } = dao;

      const currentNode: Node = {
        nodeHierarchy: {
          parentAddress: parentAddress as string,
          childNodes: mapChildNodes(hierarchy),
        },
        daoName: name as string,
        daoAddress: utils.getAddress(_daoAddress as string),
      };
      return currentNode;
    }
    return;
  }, []);

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const graphNodeInfo = formatDAOQuery({ data }, daoAddress);
      const daoName = await getDaoName(utils.getAddress(daoAddress), graphNodeInfo?.daoName);

      if (!!graphNodeInfo) {
        action.dispatch({
          type: NodeAction.SET_DAO_INFO,
          payload: Object.assign(graphNodeInfo, { daoName }),
        });
      } else {
        action.dispatch({
          type: NodeAction.UPDATE_DAO_NAME,
          payload: daoName,
        });
      }
    },
    pollInterval: ONE_MINUTE,
  });

  const loadDao = useCallback(
    async (_daoAddress: string): Promise<FractalNode | WithError> => {
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

          return Object.assign(graphNodeInfo, {
            daoName,
            safe,
            fractalModules,
          });
        } catch (e) {
          logError(e);
          return { error: 'errorInvalidSearch' };
        }
      } else {
        // invalid address
        return { error: 'errorFailedSearch' };
      }
    },
    [safeService, lookupModules, formatDAOQuery, getDAOInfo, getDaoName]
  );

  const updateSafeInfo = useCallback(
    async (_daoAddress: string) => {
      const safeInfo = await safeService.getSafeInfo(utils.getAddress(_daoAddress));
      if (!safeInfo) return;

      action.dispatch({
        type: NodeAction.SET_FRACTAL_MODULES,
        payload: await lookupModules(safeInfo.modules),
      });
      action.dispatch({
        type: NodeAction.SET_SAFE_INFO,
        payload: safeInfo,
      });
      return safeInfo;
    },
    [action, safeService, lookupModules]
  );

  const setDAO = useCallback(
    async (_daoAddress: string) => {
      if (utils.isAddress(_daoAddress) && safeService) {
        try {
          const safe = await setMethodOnInterval(() => updateSafeInfo(_daoAddress), ONE_MINUTE);
          if (!safe) {
            invalidateDAO('errorInvalidSearch');
            return;
          }
        } catch (e) {
          // network error
          logError(e);
          invalidateDAO('errorFailedSearch');
        }
      } else {
        // invalid address
        invalidateDAO('errorFailedSearch');
      }
    },
    [invalidateDAO, updateSafeInfo, setMethodOnInterval, safeService]
  );

  useEffect(() => {
    const isCurrentAddress = daoAddress === currentValidAddress.current;
    if (!currentValidAddress.current && loadOnMount) {
      if (currentValidAddress.current === undefined) {
        currentValidAddress.current = daoAddress;
      }
      if (!isCurrentAddress && daoAddress) {
        setDAO(daoAddress);
      }
    }
  }, [daoAddress, loadOnMount, setDAO, action, currentValidAddress]);

  return { loadDao };
};
