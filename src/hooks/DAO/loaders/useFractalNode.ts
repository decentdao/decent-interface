import { useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Address, getAddress, isAddress } from 'viem';
import { DAOQueryDocument } from '../../../../.graphclient';
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
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

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
        const graphRawNodeData = await getDAOInfo({ variables: { safeAddress } });
        const graphDAOData = graphRawNodeData.data?.daos[0];
        if (!graphRawNodeData || !graphDAOData) {
          throw new Error('No data found');
        }
        setDecentModules(modules);

        setDaoInfo({
          parentAddress: isAddress(graphDAOData.parentAddress)
            ? getAddress(graphDAOData.parentAddress)
            : null,
          childAddresses: graphDAOData.hierarchy.map(child => getAddress(child.address)),
          daoName: graphDAOData.name ?? null,
          daoSnapshotENS: graphDAOData.snapshotENS ?? null,
          proposalTemplatesHash: graphDAOData.proposalTemplatesHash ?? null,
        });
      } catch (e) {
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
    getDAOInfo,
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
