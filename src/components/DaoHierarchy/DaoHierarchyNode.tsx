import { Center, Flex, Icon, Link } from '@chakra-ui/react';
import { ArrowElbowDownRight } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { DAO_ROUTES } from '../../constants/routes';
import { useLoadDAONode } from '../../hooks/DAO/loaders/useLoadDAONode';
import { CacheKeys } from '../../hooks/utils/cache/cacheDefaults';
import { setValue, getValue } from '../../hooks/utils/cache/useLocalStorage';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { DaoHierarchyInfo, DaoInfo, WithError } from '../../types';
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
  const [hierarchyNode, setHierarchyNode] = useState<DaoHierarchyInfo>();
  const { addressPrefix } = useNetworkConfig();
  const chainId = useChainId();
  const { loadDao } = useLoadDAONode();

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
        const errorNode = _node as WithError;
        if (!errorNode.error) {
          const fnode = _node as DaoInfo;
          const theNode = {
            daoName: fnode.daoName,
            safeAddress: safeAddress,
            fractalModules: fnode.fractalModules,
            nodeHierarchy: {
              parentAddress: fnode.nodeHierarchy.parentAddress,
              childNodes: fnode.nodeHierarchy.childNodes,
            },
          };
          setValue(
            {
              cacheName: CacheKeys.HIERARCHY_DAO_INFO,
              chainId,
              daoAddress: safeAddress,
            },
            theNode,
          );
          setHierarchyNode(theNode);
        } else if (errorNode.error === 'errorFailedSearch') {
          setHierarchyNode(undefined);
        }
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
      {hierarchyNode?.nodeHierarchy.childNodes.map(childNode => {
        if (!childNode.safe) {
          return null;
        }
        return (
          <Flex
            minH={`${NODE_HEIGHT_REM}rem`}
            key={childNode.safe.address}
            gap="1.25rem"
          >
            <Icon
              as={ArrowElbowDownRight}
              my={`${NODE_HEIGHT_REM / 2.5}rem`}
              ml="0.5rem"
              boxSize="32px"
              color={currentSafe?.address === childNode.safe.address ? 'celery-0' : 'neutral-6'}
            />

            <DaoHierarchyNode
              safeAddress={childNode.safe.address}
              depth={depth + 1}
            />
          </Flex>
        );
      })}
    </Flex>
  );
}
