import { useQuery } from '@apollo/client';
import { Maybe } from 'graphql/jsutils/Maybe';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { DAO, DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../../providers/App/node/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useGetDAONameDeferred } from '../useGetDAOName';
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
  const { getDAOName } = useGetDAONameDeferred();

  const lookupModules = useFractalModules();

  const networkConfig = useNetworkConfig();

  const formatDAOQuery = useCallback(
    (result: { data?: DAOQueryQuery }, _daoAddress: string) => {
      if (!result.data) {
        return;
      }
      const { daos } = result.data;
      const dao = daos[0];
      if (dao) {
        let snapshotENS: Maybe<string> | undefined;
        const { parentAddress, name, proposalTemplatesHash } = dao;
        snapshotENS = dao.snapshotENS;

        // don't override if already set
        if (!snapshotENS) {
          if (networkConfig.chain === mainnet) {
            switch (_daoAddress) {
              case '0xB98d45F9021D71E6Fc30b43FD37FB3b1Bf12c064': {
                snapshotENS = 'decent-dao.eth';
                break;
              }
              default:
                break;
            }
          }
        }

        const currentNode: Node = {
          nodeHierarchy: {
            parentAddress,
            childNodes: mapChildNodes(dao as DAO),
          },
          daoName: name as string,
          daoAddress: getAddress(_daoAddress),
          daoSnapshotENS: snapshotENS as string,
          proposalTemplatesHash: proposalTemplatesHash as string,
        };
        return currentNode;
      }
      return;
    },
    [networkConfig.chain],
  );

  const { subgraph } = useNetworkConfig();

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const graphNodeInfo = formatDAOQuery({ data }, getAddress(daoAddress));
      const daoName = await getDAOName({
        address: getAddress(daoAddress),
        registryName: graphNodeInfo?.daoName,
      });

      action.dispatch({
        type: NodeAction.SET_DAO_INFO,
        payload: Object.assign(graphNodeInfo || {}, { daoName }),
      });
    },
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
    pollInterval: ONE_MINUTE,
  });

  const reset = useCallback(
    ({ error }: { error: boolean }) => {
      currentValidSafe.current = undefined;
      action.resetSafeState();
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
        const address = getAddress(_daoAddress);
        safeInfo = await safeAPI.getSafeData(address);
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
    if (
      skip ||
      addressPrefix === undefined ||
      daoAddress === undefined ||
      addressPrefix + daoAddress !== currentValidSafe.current
    ) {
      reset({ error: false });
      if (addressPrefix && daoAddress) {
        setDAO(addressPrefix, daoAddress);
      }
    }
  }, [addressPrefix, daoAddress, setDAO, reset, skip]);

  return { errorLoading };
};
