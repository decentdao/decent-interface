import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Address } from 'viem';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useGetSafeName } from '../../utils/useGetSafeName';
import { useFractalModules } from './useFractalModules';

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = ({
  addressPrefix,
  safeAddress,
}: {
  addressPrefix?: string;
  safeAddress?: Address;
}) => {
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const { action } = useFractal();
  const safeAPI = useSafeAPI();
  const { getSafeName } = useGetSafeName();

  const lookupModules = useFractalModules();

  const { subgraph } = useNetworkConfig();

  const { setDaoInfo, setFractalModules, setSafeInfo } = useDaoInfoStore();

  useQuery(DAOQueryDocument, {
    variables: { safeAddress },
    onCompleted: async data => {
      if (!safeAddress) return;

      const getNodeInfo = (result: { data?: DAOQueryQuery }) => {
        const dao = result.data?.daos[0];
        if (dao === undefined) {
          return undefined;
        }

        const { parentAddress, name, snapshotENS, proposalTemplatesHash } = dao;

        const currentNode: Node = {
          nodeHierarchy: {
            parentAddress,
            childNodes: mapChildNodes(dao),
          },
          daoName: name as string,
          address: safeAddress,
          daoSnapshotENS: snapshotENS as string,
          proposalTemplatesHash: proposalTemplatesHash as string,
        };
        return currentNode;
      };

      const graphNodeInfo = getNodeInfo({ data });
      const daoName = graphNodeInfo?.daoName ?? (await getSafeName(safeAddress));

      if (graphNodeInfo) {
        setDaoInfo({ ...graphNodeInfo, daoName });
      } else {
        setDaoInfo({ daoName });
      }
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

  const setDAO = useCallback(async () => {
    if (addressPrefix && safeAddress) {
      currentValidSafe.current = `${addressPrefix}${safeAddress}`;
      setErrorLoading(false);

      let safeInfo;

      try {
        if (!safeAPI) throw new Error('SafeAPI not set');
        safeInfo = await safeAPI.getSafeData(safeAddress);
      } catch (e) {
        // TODO: this is the thing causing an error when
        // trying to load a DAO with a valid address which is not a Safe
        reset({ error: true });
        return;
      }

      // if here, we have a valid Safe!
      setFractalModules(await lookupModules(safeInfo.modules));
      setSafeInfo(safeInfo);
    }
  }, [addressPrefix, safeAddress, setFractalModules, lookupModules, setSafeInfo, safeAPI, reset]);

  useEffect(() => {
    if (`${addressPrefix}${safeAddress}` !== currentValidSafe.current) {
      reset({ error: false });
      setDAO();
    }
  }, [addressPrefix, safeAddress, setDAO, reset]);

  return { errorLoading };
};
