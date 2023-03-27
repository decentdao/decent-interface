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
import { Node } from '../../../types';
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

export const useFractalNode = ({ daoAddress }: { daoAddress: string }) => {
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
  const loadDao = useCallback(async () => {
    if (utils.isAddress(daoAddress)) {
      try {
        currentValidAddress.current = daoAddress;
        const safe = await safeService.getSafeInfo(daoAddress);
        const fractalModules = await lookupModules(safe.modules);
        const graphNodeInfo = formatDAOQuery(await getDAOInfo({ variables: { daoAddress } }));
        if (!graphNodeInfo) {
          invalidateDAO('errorFailedSearch');
          logError('graphQL query failed');
          return;
        }
        // @todo move subgraph call here, this would move heirarchy to FractalNode?
        // const daoName = await getDAOName({ address: daoAddress });
        dispatch.node({
          type: NodeAction.SET_DAO_NODE,
          payload: {
            safe,
            fractalModules,
            ...graphNodeInfo,
          },
        });
      } catch (e) {
        logError(e);
        invalidateDAO('errorInvalidSearch');
      }
    } else {
      // invalid address
      invalidateDAO('errorFailedSearch');
    }
  }, [daoAddress, safeService, invalidateDAO, lookupModules, formatDAOQuery, getDAOInfo, dispatch]);

  useEffect(() => {
    if (daoAddress !== currentValidAddress.current) {
      loadDao();
    }
  }, [daoAddress, loadDao]);
};
