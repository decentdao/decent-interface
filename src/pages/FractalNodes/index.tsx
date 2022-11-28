import { Box, Center, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import PageHeader from '../../components/ui/Header/PageHeader';
import { DAONodeCard } from '../../components/ui/cards/DAOInfoCard';
import { BarLoader } from '../../components/ui/loaders/BarLoader';
import { HEADER_HEIGHT } from '../../constants/common';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { NodeLines } from './NodeLines';

export function FractalNodes() {
  const {
    gnosis: { safe },
  } = useFractal();
  const [isParentExpanded, setIsParentExpended] = useState(true);
  const [isChildrenExpanded, setIsChildrenExpanded] = useState(false);

  if (!safe.address) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  // @todo replace these variables
  const parentDAOAddress: string | undefined = undefined;
  const daoPermissionList: string[] = [];

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
        <DAONodeCard
          safeAddress={parentDAOAddress}
          toggleExpansion={parentExpansionToggle}
          expanded={isParentExpanded}
          numberOfChildrenDAO={1}
        />
      )}

      <Flex mt="1rem">
        {parentDAOAddress && isParentExpanded && (
          <NodeLines
            isCurrentDAO
            isFirstChild
            hasMore={!!daoPermissionList.length && isChildrenExpanded}
            extendHeight={!!daoPermissionList.length}
          />
        )}
        {isParentExpanded && (
          <DAONodeCard
            safeAddress={safe.address}
            toggleExpansion={!!daoPermissionList.length ? childrenExpansionToggle : undefined}
            expanded={isChildrenExpanded}
            numberOfChildrenDAO={daoPermissionList.length}
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
                indentFactor={!!parentDAOAddress ? 4 : 1}
              />
              <DAONodeCard
                safeAddress={safeAddress}
                expanded={false}
              />
            </Flex>
          );
        })}
    </Box>
  );
}
