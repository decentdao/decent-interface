import { Box } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { useLoadDAONode } from '../../../hooks/DAO/loaders/useLoadDAONode';
import { useLoadDAOData } from '../../../hooks/DAO/useDAOData';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalNode, WithError } from '../../../types';
import { DAONodeRow } from '../../ui/cards/DAONodeRow';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
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
  siblingCount,
}: {
  parentAddress?: string;
  daoAddress?: string;
  depth: number;
  siblingCount: number;
}) {
  const [fractalNode, setNode] = useState<FractalNode>();
  const { loadDao } = useLoadDAONode();
  const { daoData } = useLoadDAOData(fractalNode);

  const {
    node: { daoAddress: currentDAOAddress }, // used ONLY to determine if we're on the current DAO
  } = useFractal();

  const isCurrentDAO = daoAddress === currentDAOAddress;

  useEffect(() => {
    if (daoAddress) {
      loadDao(utils.getAddress(daoAddress)).then(_node => {
        const errorNode = _node as WithError;
        if (!errorNode.error) {
          setNode(_node as FractalNode);
        } else if (errorNode.error === 'errorFailedSearch') {
          setNode({
            daoName: null,
            daoAddress: null,
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
  }, [loadDao, daoAddress]);

  if (!fractalNode?.nodeHierarchy) {
    return (
      <Box
        h="6.25rem"
        my={8}
      >
        <InfoBoxLoader />
      </Box>
    );
  }

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
        numberOfSiblings={siblingCount}
        numberOfChildren={fractalNode?.nodeHierarchy.childNodes.length}
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
            siblingCount={childNode?.nodeHierarchy.childNodes.length}
          />
        </Box>
      ))}
    </Box>
  );
}
