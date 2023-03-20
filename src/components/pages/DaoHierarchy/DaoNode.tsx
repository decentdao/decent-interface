import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { DAONodeCard } from '../../ui/cards/DAOInfoCard';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import { NodeLineVertical } from './NodeLines';
import { useFetchNodes } from './useFetchNodes';

export function DaoNode({
  parentSafeAddress,
  safeAddress,
  trueDepth,
  numberOfSiblings,
}: {
  parentSafeAddress?: string;
  safeAddress: string;
  trueDepth: number;
  numberOfSiblings?: number;
}) {
  const { childNodes } = useFetchNodes(safeAddress);
  const [isChildrenExpanded, setIsChildrenExpanded] = useState(!parentSafeAddress);
  const childrenExpansionToggle = () => {
    setIsChildrenExpanded(v => !v);
  };

  const {
    gnosis: {
      safe: { address: currentDAOAddress },
    },
  } = useFractal();
  if (!childNodes) {
    return <InfoBoxLoader />;
  }

  return (
    <Box position="relative">
      <DAONodeCard
        parentSafeAddress={parentSafeAddress}
        safeAddress={safeAddress}
        toggleExpansion={!!childNodes?.length ? childrenExpansionToggle : undefined}
        expanded={isChildrenExpanded}
        numberOfChildrenDAO={childNodes?.length}
        depth={trueDepth}
      />
      <NodeLineVertical
        trueDepth={trueDepth}
        numberOfSiblings={numberOfSiblings}
        numberOfChildren={childNodes?.length}
        isCurrentDAO={currentDAOAddress === safeAddress}
      />

      {isChildrenExpanded &&
        childNodes.map(node => (
          <Box
            key={node.address}
            ml={24}
            position="relative"
          >
            <DaoNode
              safeAddress={node.address}
              parentSafeAddress={safeAddress}
              trueDepth={trueDepth + 1}
              numberOfSiblings={childNodes.length}
            />
          </Box>
        ))}
    </Box>
  );
}
