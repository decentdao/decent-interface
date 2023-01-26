import { Box, Center, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DAONodeCard } from '../../components/ui/cards/DAOInfoCard';
import { BarLoader } from '../../components/ui/loaders/BarLoader';
import PageHeader from '../../components/ui/page/Header/PageHeader';
import { HEADER_HEIGHT } from '../../constants/common';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { ChildNode } from '../../providers/Fractal/types';
import { NodeLines } from './NodeLines';

function DAOChildNodes({
  childNodes,
  parentDAOAddress,
}: {
  childNodes?: ChildNode[];
  parentDAOAddress?: string;
}) {
  if (!childNodes) {
    return null;
  }
  return (
    <Flex
      flexWrap="wrap"
      w="full"
    >
      {childNodes.map((node, i, arr) => {
        const isFirstChild = i === 0;
        const hasMore = !!node.childNodes?.length || i + 1 < arr.length;
        return (
          <Flex
            key={node.address}
            mt={isFirstChild ? '1rem' : undefined}
            width="100%"
            flexWrap="wrap"
          >
            <NodeLines
              hasMore={hasMore}
              isFirstChild={isFirstChild}
              extendHeight={hasMore}
              indentFactor={!!parentDAOAddress ? 4 : 1}
            />
            <DAONodeCard
              safeAddress={node.address}
              expanded={false}
            />
            <DAOChildNodes
              parentDAOAddress={node.address}
              childNodes={node.childNodes}
            />
          </Flex>
        );
      })}
    </Flex>
  );
}

export function FractalNodes() {
  const {
    gnosis: { safe, parentDAOAddress, childNodes },
  } = useFractal();
  const [isParentExpanded, setIsParentExpended] = useState(true);
  const [isChildrenExpanded, setIsChildrenExpanded] = useState(true);
  const { t } = useTranslation(['breadcrubms']);

  if (!safe.address) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  const parentExpansionToggle = () => {
    setIsParentExpended(v => !v);
  };

  const childrenExpansionToggle = () => {
    setIsChildrenExpanded(v => !v);
  };
  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('nodes', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
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
            hasMore={!!childNodes?.length && isChildrenExpanded}
            extendHeight={!!childNodes?.length}
          />
        )}
        {isParentExpanded && (
          <DAONodeCard
            safeAddress={safe.address}
            toggleExpansion={!!childNodes?.length ? childrenExpansionToggle : undefined}
            expanded={isChildrenExpanded}
            numberOfChildrenDAO={childNodes?.length}
          />
        )}
      </Flex>

      {isChildrenExpanded && (
        <DAOChildNodes
          parentDAOAddress={parentDAOAddress}
          childNodes={childNodes}
        />
      )}
    </Box>
  );
}
