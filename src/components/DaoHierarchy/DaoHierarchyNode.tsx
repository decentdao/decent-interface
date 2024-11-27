import { useLazyQuery } from '@apollo/client';
import { Center, Flex, Icon, Link } from '@chakra-ui/react';
import { AlignCenterVertical, ArrowElbowDownRight } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { DAOQueryDocument } from '../../../.graphclient';
import { DAO_ROUTES } from '../../constants/routes';
import { useDecentModules } from '../../hooks/DAO/loaders/useDecentModules';
import { CacheKeys } from '../../hooks/utils/cache/cacheDefaults';
import { setValue, getValue } from '../../hooks/utils/cache/useLocalStorage';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { DaoHierarchyInfo } from '../../types';
import { DAONodeInfoCard, NODE_HEIGHT_REM } from '../ui/cards/DAONodeInfoCard';
import { BarLoader } from '../ui/loaders/BarLoader';

/**
 * A recursive component that displays a "hierarchy" of DAOInfoCards.
 *
 * The initial declaration of this component should provide the info of
 * the DAO you would like to display at the top level of the hierarchy.
 *
 * From this initial DAO info, the component will get the DAO's children
 * and display another DaoNode for each child, and so on for their children.
 */
export function DaoHierarchyNode({
  safeAddress,
  depth,
}: {
  safeAddress: Address | null;
  depth: number;
}) {
  const { safe: currentSafe } = useDaoInfoStore();
  const { t } = useTranslation('common');
  const safeApi = useSafeAPI();
  const [hierarchyNode, setHierarchyNode] = useState<DaoHierarchyInfo>();
  const [hasErrorLoading, setErrorLoading] = useState<boolean>(false);
  const { addressPrefix, subgraph } = useNetworkConfig();
  const chainId = useChainId();
  const lookupModules = useDecentModules();

  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

  const loadDao = useCallback(
    async (_safeAddress: Address) => {
      if (!safeApi) {
        throw new Error('Safe API not ready');
      }
      try {
        const safe = await safeApi.getSafeInfo(_safeAddress);
        const graphRawNodeData = await getDAOInfo({ variables: { safeAddress: _safeAddress } });
        const modules = await lookupModules(safe.modules);
        const graphDAOData = graphRawNodeData.data?.daos[0];
        if (!graphRawNodeData || !graphDAOData) {
          throw new Error('No data found');
        }
        return {
          daoName: graphDAOData.name as string | undefined,
          safeAddress: _safeAddress,
          parentAddress: graphDAOData.parentAddress,
          childAddresses: graphDAOData.hierarchy.map(child => child.address),
          daoSnapshotENS: graphDAOData.snapshotENS as string | undefined,
          proposalTemplatesHash: graphDAOData.proposalTemplatesHash as string | undefined,
          modules,
        };
      } catch (e) {
        setErrorLoading(true);
      }
    },
    [getDAOInfo, lookupModules, safeApi],
  );

  useEffect(() => {
    if (safeAddress) {
      const cachedNode = getValue({
        cacheName: CacheKeys.HIERARCHY_DAO_INFO,
        chainId,
        daoAddress: safeAddress,
      });
      if (cachedNode) {
        setHierarchyNode(cachedNode);
        return;
      }
      loadDao(safeAddress).then(_node => {
        setValue(
          {
            cacheName: CacheKeys.HIERARCHY_DAO_INFO,
            chainId,
            daoAddress: safeAddress,
          },
          _node,
        );
        setHierarchyNode(_node);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!hierarchyNode) {
    // node hasn't loaded yet
    return (
      <Flex
        w="full"
        minH="full"
      >
        <Center w="100%">
          <BarLoader />
        </Center>
      </Flex>
    );
  }

  if (hasErrorLoading) {
    return (
      <Flex
        w="full"
        minH="full"
      >
        <Center w="100%">
          <Icon
            as={AlignCenterVertical}
            boxSize="32px"
            color="neutral-6"
          />
          <div>{t('errorMySafesNotLoaded')}</div>
        </Center>
      </Flex>
    );
  }

  const isCurrentViewingDAO =
    currentSafe?.address.toLowerCase() === hierarchyNode.safeAddress.toLocaleLowerCase();
  return (
    <Flex
      flexDirection="column"
      alignItems="stretch"
      gap="1.25rem"
      width="100%"
    >
      <Link
        as={RouterLink}
        to={DAO_ROUTES.dao.relative(addressPrefix, hierarchyNode.safeAddress)}
        _hover={{ textDecoration: 'none', cursor: isCurrentViewingDAO ? 'default' : 'pointer' }}
        onClick={event => {
          if (isCurrentViewingDAO) {
            event.preventDefault();
          }
        }}
      >
        <DAONodeInfoCard
          node={{
            daoAddress: hierarchyNode.safeAddress,
            daoName: hierarchyNode?.daoName ?? hierarchyNode.safeAddress,
            daoSnapshotENS: hierarchyNode?.daoSnapshotENS,
          }}
          isCurrentViewingDAO={isCurrentViewingDAO}
        />
      </Link>

      {/* CHILD NODES */}
      {hierarchyNode?.childAddresses.map(childAddress => {
        return (
          <Flex
            minH={`${NODE_HEIGHT_REM}rem`}
            key={childAddress}
            gap="1.25rem"
          >
            <Icon
              as={ArrowElbowDownRight}
              my={`${NODE_HEIGHT_REM / 2.5}rem`}
              ml="0.5rem"
              boxSize="32px"
              color={currentSafe?.address === childAddress ? 'celery-0' : 'neutral-6'}
            />

            <DaoHierarchyNode
              safeAddress={childAddress}
              depth={depth + 1}
            />
          </Flex>
        );
      })}
    </Flex>
  );
}
