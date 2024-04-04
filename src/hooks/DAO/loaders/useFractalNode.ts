import { useQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../../providers/App/node/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = (
  skip: boolean,
  {
    addressPrefix,
    daoAddress,
  }: {
    addressPrefix?: string;
    daoAddress?: string;
  },
) => {
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const { action } = useFractal();
  const safeAPI = useSafeAPI();
  const { getDaoName } = useLazyDAOName();

  const lookupModules = useFractalModules();

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

  const { subgraphChainName } = useNetworkConfig();

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
    context: { chainName: subgraphChainName },
    pollInterval: ONE_MINUTE,
  });

  const reset = useCallback(
    ({ error }: { error: boolean }) => {
      currentValidSafe.current = undefined;
      action.resetDAO();
      setErrorLoading(error);
    },
    [action],
  );

  const setDAO = useCallback(
    async (_addressPrefix: string, _daoAddress: string) => {
      currentValidSafe.current = _addressPrefix + _daoAddress;
      setErrorLoading(false);

      let safeInfo;

      try {
        if (!safeAPI) throw new Error('SafeAPI not set');

        const address = utils.getAddress(_daoAddress);
        const safeInfoResponse = await safeAPI.getSafeInfo(address);
        const nextNonce = await safeAPI.getNextNonce(address);
        safeInfo = { ...safeInfoResponse, nonce: nextNonce };
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
    },
    [action, lookupModules, reset, safeAPI],
  );

  useEffect(() => {
    if (skip || addressPrefix === undefined || daoAddress === undefined) {
      reset({ error: false });
      return;
    }

    if (addressPrefix + daoAddress !== currentValidSafe.current) {
      setDAO(addressPrefix, daoAddress);
    }
  }, [addressPrefix, daoAddress, setDAO, reset, skip]);

  return { errorLoading };
};
