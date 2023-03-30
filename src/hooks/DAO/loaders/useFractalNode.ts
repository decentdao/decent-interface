import { LazyQueryResult, useLazyQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DAOQueryDocument, DAOQueryQuery, Exact } from '../../../../.graphclient';
import { BASE_ROUTES } from '../../../constants/routes';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { NodeAction } from '../../../providers/App/node/action';
import { FractalNode, Node } from '../../../types';
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

export const useFractalNode = ({
  daoAddress,
  loadOnMount = true,
}: {
  daoAddress: string;
  loadOnMount?: boolean;
}) => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | undefined>();
  const {
    clients: { safeService },
    dispatch,
  } = useFractal();
  const { t } = useTranslation();
  const { replace } = useRouter();

  const lookupModules = useFractalModules();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument);

  const invalidateDAO = useCallback(
    (errorMessage: string) => {
      // invalid DAO
      toast(t(errorMessage), { toastId: 'invalid-dao' });
      dispatch.resetDAO();
      replace(BASE_ROUTES.landing);
    },
    [dispatch, replace, t]
  );

  const formatDAOQuery = useCallback(
    (
      result: LazyQueryResult<
        DAOQueryQuery,
        Exact<{
          daoAddress?: any;
        }>
      >,
      _daoAddress: string
    ) => {
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
    },
    []
  );

  // loads dao from safe
  type WithError = { error?: string };
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

          return Object.assign(graphNodeInfo, {
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
    [safeService, lookupModules, formatDAOQuery, getDAOInfo]
  );

  const setDAO = useCallback(
    async (_daoAddress: string) => {
      if (utils.isAddress(_daoAddress)) {
        const safe = await safeService.getSafeInfo(_daoAddress);
        if (!safe) {
          invalidateDAO('errorInvalidSearch');
          return;
        }
        await dispatch.resetDAO();
        dispatch.node({
          type: NodeAction.SET_SAFE_INFO,
          payload: safe,
        });
        dispatch.node({
          type: NodeAction.SET_FRACTAL_MODULES,
          payload: await lookupModules(safe.modules),
        });
        const graphNodeInfo = formatDAOQuery(
          await getDAOInfo({ variables: { daoAddress: _daoAddress } }),
          _daoAddress
        );
        if (!!graphNodeInfo) {
          dispatch.node({
            type: NodeAction.SET_DAO_INFO,
            payload: graphNodeInfo,
          });
        }
      } else {
        // invalid address
        invalidateDAO('errorFailedSearch');
      }
    },
    [dispatch, invalidateDAO, safeService, lookupModules, formatDAOQuery, getDAOInfo]
  );

  useEffect(() => {
    const isCurrentAddress = daoAddress === currentValidAddress.current;
    if (!currentValidAddress.current && loadOnMount) {
      if (currentValidAddress.current === undefined) {
        currentValidAddress.current = daoAddress;
      }
      if (!isCurrentAddress) {
        setDAO(daoAddress);
      }
    }
  }, [daoAddress, loadOnMount, setDAO, dispatch, currentValidAddress]);

  return { loadDao };
};
