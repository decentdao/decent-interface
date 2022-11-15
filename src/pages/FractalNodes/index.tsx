import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import PageHeader from '../../components/ui/Header/PageHeader';
import { DAOInfoCard } from '../../components/ui/cards/DAOInfoCard';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { NodeLines } from './NodeLines';

export function FractalNodes() {
  const {
    gnosis: { safe },
  } = useFractal();

  const [isParentExpanded, setIsParentExpended] = useState(true);
  const [isChildrenExpanded, setIsChildrenExpanded] = useState(false);

  if (!safe.address) {
    return <InfoBoxLoader />;
  }
  // @todo replace these variables
  const parentDAOAddress: string | undefined = safe.address;
  const daoPermissionList: string[] = [safe.address, safe.address];

  const parentExpansionToggle = () => {
    setIsParentExpended(v => !v);
  };

  const childrenExpansionToggle = () => {
    setIsChildrenExpanded(v => !v);
  };
  return (
    <Box>
      <PageHeader
        title="Nodes"
        titleTestId="nodes-title"
      />
      {parentDAOAddress && (
        <DAOInfoCard
          safeAddress={parentDAOAddress}
          toggleExpansion={parentExpansionToggle}
          expanded={isParentExpanded}
          hasChildren={true}
        />
      )}

      <Flex mt="1rem">
        {parentDAOAddress && isParentExpanded && (
          <NodeLines
            isFirstChild
            hasMore={!!daoPermissionList.length && isChildrenExpanded}
            extendHeight={!!daoPermissionList.length}
          />
        )}
        {isParentExpanded && (
          <DAOInfoCard
            safeAddress={safe.address}
            toggleExpansion={childrenExpansionToggle}
            expanded={isChildrenExpanded}
            hasChildren={!!daoPermissionList.length}
          />
        )}
      </Flex>

      {isChildrenExpanded &&
        daoPermissionList.map((safeAddress, i, arr) => {
          const isFirstChild = i === 0 && !parentDAOAddress;
          const hasMore = i + 1 < arr.length;
          return (
            <Flex
              key={safeAddress + i}
              mt={isFirstChild ? '1rem' : undefined}
            >
              <NodeLines
                hasMore={hasMore}
                isFirstChild={isFirstChild}
                extendHeight={hasMore}
                indentfactor={!!parentDAOAddress ? 4 : 1}
              />
              <DAOInfoCard
                safeAddress={safeAddress}
                toggleExpansion={() => {}}
                expanded={false}
              />
            </Flex>
          );
        })}
    </Box>
  );
}
