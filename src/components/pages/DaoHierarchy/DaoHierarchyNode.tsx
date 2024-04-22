import { Flex, HStack, Icon } from '@chakra-ui/react';
import { ArrowElbowDownRight } from '@phosphor-icons/react';
import { utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useLoadDAONode } from '../../../hooks/DAO/loaders/useLoadDAONode';
import { useLoadDAOData } from '../../../hooks/DAO/useDAOData';
import { FractalNode, WithError } from '../../../types';
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
  daoAddress,
  depth,
}: {
  parentAddress?: string;
  daoAddress?: string;
  depth: number;
}) {
  const [fractalNode, setNode] = useState<FractalNode>();
  const { loadDao } = useLoadDAONode();
  const { daoData } = useLoadDAOData(fractalNode, parentAddress);

  // calculates the total number of descendants below the given node
  const getTotalDescendants = useCallback((node: FractalNode): number => {
    let count = node.nodeHierarchy.childNodes.length;
    node.nodeHierarchy.childNodes.forEach(child => {
      count += getTotalDescendants(child as FractalNode);
    });
    return count;
  }, []);

  useEffect(() => {
    if (daoAddress) {
      loadDao(utils.getAddress(daoAddress)).then(_node => {
        const errorNode = _node as WithError;
        if (!errorNode.error) {
          const fnode = _node as FractalNode;
          setNode(fnode);
        } else if (errorNode.error === 'errorFailedSearch') {
          setNode({
            daoName: null,
            daoAddress,
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
  }, [loadDao, daoAddress, depth, getTotalDescendants]);

  return (
    <Flex
      flexDirection="column"
      alignItems="stretch"
      gap="1.25rem"
      width="100%"
    >
      <DAONodeInfoCard
        parentAddress={parentAddress}
        node={fractalNode}
        freezeGuard={daoData?.freezeGuard}
        guardContracts={daoData?.freezeGuardContracts}
      />

      {/* CHILD NODES */}
      {fractalNode?.nodeHierarchy.childNodes.map(childNode => (
        <HStack
          minH={`${NODE_HEIGHT_REM}rem`}
          key={childNode.daoAddress}
          gap="1.25rem"
        >
          <Icon
            as={ArrowElbowDownRight}
            boxSize="32px"
            color="neutral-6"
          />
          <DaoHierarchyNode
            parentAddress={daoAddress}
            daoAddress={childNode.daoAddress || undefined}
            depth={depth + 1}
          />
        </HStack>
      ))}
    </Flex>
  );
}
