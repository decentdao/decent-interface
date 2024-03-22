import { Box } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { useLoadDAONode } from '../../../hooks/DAO/loaders/useLoadDAONode';
import { useLoadDAOData } from '../../../hooks/DAO/useDAOData';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalNode, WithError } from '../../../types';
import { DAONodeRow } from '../../ui/cards/DAONodeRow';
import { NodeLineVertical } from './NodeLines';

/**
 * A recursive component that displays a "hierarchy" of DAOInfoCards.
 *
 * The initial declaration of this component should provide the info of
 * the DAO you would like to display at the top level of the hierarchy.
 *
 * From this initial DAO info, the component will get the DAO's children
 * and display another DaoNode for each child, and so on for their children.
 */
export function DaoNode({
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
  const [lastChildDescendants, setLastChildDescendants] = useState<number>(0);

  const {
    node: { daoAddress: currentDAOAddress }, // used ONLY to determine if we're on the current DAO
  } = useFractal();

  const isCurrentDAO = daoAddress === currentDAOAddress;

  useEffect(() => {
    if (daoAddress) {
      loadDao(utils.getAddress(daoAddress)).then(_node => {
        const errorNode = _node as WithError;
        if (!errorNode.error) {
          // calculates the total number of descendants below the given node
          const getTotalDescendants = (node: FractalNode): number => {
            let count = node.nodeHierarchy.childNodes.length;
            node.nodeHierarchy.childNodes.forEach(child => {
              count += getTotalDescendants(child as FractalNode);
            });
            return count;
          };

          const fnode = _node as FractalNode;
          setNode(fnode);
          // calculate the total number of descendants of the last child
          // in the current hierarchy level
          // this allows us to properly calculate how far down the vertical
          // line should extend
          setLastChildDescendants(
            fnode.nodeHierarchy.childNodes.length > 0
              ? getTotalDescendants(
                  fnode.nodeHierarchy.childNodes[
                    fnode.nodeHierarchy.childNodes.length - 1
                  ] as FractalNode,
                )
              : 0,
          );
        } else if (errorNode.error === 'errorFailedSearch') {
          setNode({
            daoName: null,
            daoAddress: daoAddress,
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
  }, [loadDao, daoAddress, depth]);

  return (
    <Box position="relative">
      <DAONodeRow
        parentAddress={parentAddress}
        node={fractalNode}
        childCount={fractalNode?.nodeHierarchy.childNodes.length}
        guardContracts={daoData?.freezeGuardContracts}
        freezeGuard={daoData?.freezeGuard}
        depth={depth}
      />
      <NodeLineVertical
        trueDepth={depth}
        lastChildDescendants={lastChildDescendants}
        isCurrentDAO={isCurrentDAO}
      />
      {fractalNode?.nodeHierarchy.childNodes.map(childNode => (
        <Box
          key={childNode.daoAddress}
          ml={24}
          position="relative"
        >
          <DaoNode
            parentAddress={daoAddress}
            daoAddress={childNode.daoAddress || undefined}
            depth={depth + 1}
          />
        </Box>
      ))}
    </Box>
  );
}
