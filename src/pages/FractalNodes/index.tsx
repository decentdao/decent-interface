import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/Header/PageHeader';
import { DAONodeCard } from '../../components/ui/cards/DAOInfoCard';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../routes/constants';
import { NodeLines } from './NodeLines';

export function FractalNodes() {
  const {
    gnosis: { safe },
  } = useFractal();
  const navigate = useNavigate();
  const [isParentExpanded, setIsParentExpended] = useState(true);
  const [isChildrenExpanded, setIsChildrenExpanded] = useState(false);

  const getOptions = (safeAddress: string) => {
    return [
      {
        optionKey: 'optionCreateSubDAO',
        function: () => navigate(DAO_ROUTES.newSubDao.relative(safeAddress)),
      },
      { optionKey: 'optionInitiateFreeze', function: () => {} }, // TODO freeze hook (if parent voting holder)
    ];
  };

  if (!safe.address) {
    return <InfoBoxLoader />;
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
          options={getOptions(parentDAOAddress)}
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
          <DAONodeCard
            safeAddress={safe.address}
            toggleExpansion={!!daoPermissionList.length ? childrenExpansionToggle : undefined}
            expanded={isChildrenExpanded}
            numberOfChildrenDAO={daoPermissionList.length}
            options={getOptions(safe.address)}
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
              <DAONodeCard
                safeAddress={safeAddress}
                toggleExpansion={() => {}}
                expanded={false}
                options={getOptions(safeAddress)}
              />
            </Flex>
          );
        })}
    </Box>
  );
}
