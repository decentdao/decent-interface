import { useCallback, useEffect, useRef, useState } from 'react';
import { useClient } from 'urql';
import { Address, getAddress, isAddress } from 'viem';
import { DAOQueryDocument } from '../../../graphql/DAOQuery';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfigStore } from '../../../providers/NetworkConfig/useNetworkConfigStore';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { useDecentModules } from './useDecentModules';

export const useFractalNode = ({
  addressPrefix,
  safeAddress,
  wrongNetwork,
}: {
  addressPrefix?: string;
  safeAddress?: Address;
  wrongNetwork?: boolean;
}) => {
  const safeApi = useSafeAPI();
  const lookupModules = useDecentModules();
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [errorLoading, setErrorLoading] = useState<boolean>(false);
  const { subgraph } = useNetworkConfigStore();
  const client = useClient();

  const { action } = useFractal();

  const { setDaoInfo, setSafeInfo, setDecentModules } = useDaoInfoStore();

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

      try {
        const safeInfo = await safeApi.getSafeData(safeAddress);
        setSafeInfo(safeInfo);

        const modules = await lookupModules(safeInfo.modules);

        const graphRawNodeData = await client.query(
          DAOQueryDocument,
          { safeAddress },
          {
            requestPolicy: 'network-only',
            context: {
              subgraphSpace: subgraph.space,
              subgraphSlug: subgraph.slug,
              subgraphVersion: subgraph.version,
            },
          },
        );

        if (graphRawNodeData.error) {
          throw new Error('Failed to fetch DAO data');
        }

        const graphDAOData = graphRawNodeData.data?.daos[0];

        if (!graphRawNodeData || !graphDAOData) {
          console.error('No graph data found');
        }

        setDecentModules(modules);

        setDaoInfo({
          parentAddress: isAddress(graphDAOData?.parentAddress)
            ? getAddress(graphDAOData.parentAddress)
            : null,
          childAddresses:
            graphDAOData?.hierarchy?.map((child: { address: string }) =>
              getAddress(child.address),
            ) ?? [],
          daoName: graphDAOData?.name ?? null,
          daoSnapshotENS: graphDAOData?.snapshotENS ?? null,
          proposalTemplatesHash: graphDAOData?.proposalTemplatesHash ?? null,
        });
      } catch (e) {
        console.error('Error in setDAO:', e);
        reset({ error: true });
        return;
      }
    }
  }, [
    addressPrefix,
    safeAddress,
    safeApi,
    setSafeInfo,
    lookupModules,
    client,
    subgraph.space,
    subgraph.slug,
    subgraph.version,
    setDecentModules,
    setDaoInfo,
    reset,
  ]);

  useEffect(() => {
    if (`${addressPrefix}${safeAddress}` !== currentValidSafe.current && !wrongNetwork) {
      reset({ error: false });
      setDAO();
    }
  }, [addressPrefix, safeAddress, setDAO, reset, wrongNetwork]);

  return { errorLoading };
};
