import { Flex, Icon } from '@chakra-ui/react';
import { ArrowElbowDownRight } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { Address, getAddress, zeroAddress } from 'viem';
import { useLoadDAONode } from '../../../hooks/DAO/loaders/useLoadDAONode';
import { useLoadDAOData } from '../../../hooks/DAO/useDAOData';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalNode, WithError, Node } from '../../../types';
import { DAONodeInfoCard, NODE_HEIGHT_REM } from '../../ui/cards/DAONodeInfoCard';

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
  parentAddress,
  safeAddress,
  depth,
}: {
  parentAddress: Address | null;
  safeAddress: Address | null;
  depth: number;
}) {
  const {
    node: { safe: currentSafe },
  } = useFractal();
  const [fractalNode, setNode] = useState<FractalNode>();
  const { loadDao } = useLoadDAONode();
  const { daoData } = useLoadDAOData(parentAddress, fractalNode);

  // calculates the total number of descendants below the given node
  const getTotalDescendants = useCallback((node: Node): number => {
    let count = node.nodeHierarchy.childNodes.length;
    node.nodeHierarchy.childNodes.forEach(child => {
      count += getTotalDescendants(child);
    });
    return count;
  }, []);

  useEffect(() => {
    if (safeAddress) {
      loadDao(getAddress(safeAddress)).then(_node => {
        const errorNode = _node as WithError;
        if (!errorNode.error) {
          const fnode = _node as FractalNode;
          setNode(fnode);
        } else if (errorNode.error === 'errorFailedSearch') {
          setNode({
            daoName: null,
            safe: null,
            fractalModules: [],
            nodeHierarchy: {
              parentAddress: null,
              childNodes: [],
            },
          });
        }
      });
    }
  }, [loadDao, safeAddress, depth, getTotalDescendants]);

  return (
    <Flex
      flexDirection="column"
      alignItems="stretch"
      gap="1.25rem"
      width="100%"
    >
      <DAONodeInfoCard
        node={fractalNode}
        freezeGuard={daoData?.freezeGuard}
        guardContracts={daoData?.freezeGuardContracts}
      />

      {/* CHILD NODES */}
      {fractalNode?.nodeHierarchy.childNodes.map(childNode => (
        <Flex
          minH={`${NODE_HEIGHT_REM}rem`}
          key={childNode.address}
          gap="1.25rem"
        >
          <Icon
            as={ArrowElbowDownRight}
            my={`${NODE_HEIGHT_REM / 2.5}rem`}
            ml="0.5rem"
            boxSize="32px"
            color={
              currentSafe?.address === getAddress(childNode.address || zeroAddress)
                ? 'celery-0'
                : 'neutral-6'
            }
          />

          <DaoHierarchyNode
            parentAddress={safeAddress}
            safeAddress={childNode.address}
            depth={depth + 1}
          />
        </Flex>
      ))}
    </Flex>
  );
}
