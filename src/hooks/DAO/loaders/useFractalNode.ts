import { useQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetwork } from 'wagmi';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { useSubgraphChainName } from '../../../graphql/utils';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../../providers/App/node/action';
import { disconnectedChain } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useAsyncRetry } from '../../utils/useAsyncRetry';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = ({ daoAddress }: { daoAddress?: string }) => {
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [nodeLoading, setNodeLoading] = useState<boolean>(true);
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const { action } = useFractal();
  const safeAPI = useSafeAPI();
  const { getDaoName } = useLazyDAOName();

  const lookupModules = useFractalModules();
  const { requestWithRetries } = useAsyncRetry();

  const formatDAOQuery = useCallback((result: { data?: DAOQueryQuery }, _daoAddress: string) => {
    if (!result.data) {
      return;
    }
    const { daos } = result.data;
    const dao = daos[0];
    if (dao) {
      const { parentAddress, name, hierarchy, snapshotURL, proposalTemplatesHash } = dao;

      const currentNode: Node = {
        nodeHierarchy: {
          parentAddress: parentAddress as string,
          childNodes: mapChildNodes(hierarchy),
        },
        daoName: name as string,
        daoAddress: utils.getAddress(_daoAddress as string),
        daoSnapshotURL: snapshotURL as string,
        proposalTemplatesHash: proposalTemplatesHash as string,
      };
      return currentNode;
    }
    return;
  }, []);

  const chainName = useSubgraphChainName();

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
    context: { chainName },
    pollInterval: ONE_MINUTE,
  });

  const fetchSafeInfo = useCallback(async () => {
    if (daoAddress && safeAPI) {
      const safeInfo = await safeAPI.getSafeInfo(utils.getAddress(daoAddress));
      return safeInfo;
    }
  }, [safeAPI, daoAddress]);

  const setDAO = useCallback(
    async (_chainId: number, _daoAddress: string) => {
      setNodeLoading(true);
      setErrorLoading(false);
      if (utils.isAddress(_daoAddress) && safeAPI) {
        try {
          const safeInfo = await requestWithRetries(fetchSafeInfo, 5);
          if (!safeInfo) {
            currentValidSafe.current = undefined;
            action.resetDAO();
            setErrorLoading(true);
          } else {
            currentValidSafe.current = _chainId + _daoAddress;
            action.dispatch({
              type: NodeAction.SET_FRACTAL_MODULES,
              payload: await lookupModules(safeInfo.modules),
            });
            action.dispatch({
              type: NodeAction.SET_SAFE_INFO,
              payload: safeInfo,
            });
            setErrorLoading(false);
          }
        } catch (e) {
          // network error
          currentValidSafe.current = undefined;
          action.resetDAO();
          setErrorLoading(true);
        }
      } else {
        // invalid address
        currentValidSafe.current = undefined;
        action.resetDAO();
        setErrorLoading(true);
      }
      setNodeLoading(false);
    },
    [action, safeAPI, lookupModules, fetchSafeInfo, requestWithRetries],
  );

  const { chain } = useNetwork();
  const chainId = chain ? chain.id : disconnectedChain.id;
  useEffect(() => {
    if (daoAddress && chainId + daoAddress !== currentValidSafe.current) {
      setNodeLoading(true);
      setDAO(chainId, daoAddress);
    }
  }, [daoAddress, setDAO, currentValidSafe, chainId]);

  return { nodeLoading, errorLoading };
};
