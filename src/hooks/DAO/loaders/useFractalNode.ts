import { useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Address, getAddress, isAddress } from 'viem';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';

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
  const { subgraph } = useNetworkConfig();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

  const { action } = useFractal();

  const { setDaoInfo } = useDaoInfoStore();

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
        const graphRawNodeData = await getDAOInfo({ variables: { safeAddress } });
        const graphDAOData = graphRawNodeData.data?.daos[0];
        if (!graphRawNodeData || !graphDAOData) {
          throw new Error('No data found');
        }

        setDaoInfo({
          parentAddress: isAddress(graphDAOData.parentAddress)
            ? getAddress(graphDAOData.parentAddress)
            : null,
          childAddresses: graphDAOData.hierarchy.map(child => getAddress(child.address)),
          daoName: graphDAOData.name,
          daoSnapshotENS: graphDAOData.snapshotENS,
          proposalTemplatesHash: graphDAOData.proposalTemplatesHash,
        });
      } catch (e) {
        reset({ error: true });
        return;
      }
    }
  }, [addressPrefix, safeAddress, getDAOInfo, setDaoInfo, reset]);

  useEffect(() => {
    if (`${addressPrefix}${safeAddress}` !== currentValidSafe.current) {
      reset({ error: false });
      setDAO();
    }
  }, [addressPrefix, safeAddress, setDAO, reset]);

  return { errorLoading };
};
