import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { DAONodeCard } from '../../components/ui/cards/DAOInfoCard';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { NodeLineVertical } from './NodeLines';
import { useFetchNodes } from './useFetchNodes';

export function DaoNode({
  parentSafeAddress,
  safeAddress,
  trueDepth,
}: {
  parentSafeAddress?: string;
  safeAddress: string;
  trueDepth: number;
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
            />
          </Box>
        ))}
    </Box>
  );
}
