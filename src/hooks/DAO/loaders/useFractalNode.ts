import { LazyQueryResult, useLazyQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useRouter } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';
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
  const currentValidAddress = useRef<string>();
  const {
    clients: { safeService },
    dispatch,
  } = useFractal();

  const { push } = useRouter();

  const lookupModules = useFractalModules();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument);

  const invalidateDAO = useCallback(
    (errorMessage: string) => {
      // invalid DAO
      currentValidAddress.current = undefined;
      toast(errorMessage, { toastId: 'invalid-dao' });
      push(BASE_ROUTES.landing);
      dispatch.resetDAO();
    },
    [dispatch, push]
  );

  const formatDAOQuery = useCallback(
    (
      result: LazyQueryResult<
        DAOQueryQuery,
        Exact<{
          daoAddress?: any;
        }>
      >
    ) => {
      if (!result.data) {
        return;
      }
      const { daos } = result.data;
      const dao = daos[0];
      if (dao) {
        const { parentAddress, name, hierarchy, address } = dao;

        const currentNode: Node = {
          nodeHierarchy: {
            parentAddress: parentAddress as string,
            childNodes: mapChildNodes(hierarchy),
          },
          daoName: name as string,
          daoAddress: utils.getAddress(address as string),
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
          currentValidAddress.current = _daoAddress;
          const safe = await safeService.getSafeInfo(_daoAddress);
          const fractalModules = await lookupModules(safe.modules);
          const graphNodeInfo = formatDAOQuery(
            await getDAOInfo({ variables: { daoAddress: _daoAddress } })
          );
          if (!graphNodeInfo) {
            logError('graphQL query failed');
            return { error: 'errorFailedSearch' };
          }
          console.count('useFractalNode');

          return {
            safe,
            fractalModules,
            ...graphNodeInfo,
          };
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
      if (_daoAddress) {
        const fractalNode = await loadDao(_daoAddress);
        if ((fractalNode as WithError).error) {
          invalidateDAO('errorInvalidSearch');
          return;
        }
        dispatch.node({
          type: NodeAction.SET_DAO_NODE,
          payload: fractalNode as FractalNode,
        });
      }
    },
    [dispatch, invalidateDAO, loadDao]
  );

  useEffect(() => {
    if (daoAddress !== currentValidAddress.current && loadOnMount) {
      setDAO(daoAddress);
    }
  }, [daoAddress, loadOnMount, setDAO]);

  return { loadDao };
};
