import { Box, Flex } from '@chakra-ui/react';
import PageHeader from '../../components/ui/Header/PageHeader';
import { DAOInfoCard } from '../../components/ui/cards/DAOInfoCard';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { NodeLines } from './NodeLines';

export function FractalNodes() {
  const {
    gnosis: { safe },
  } = useFractal();

  if (!safe.address) {
    return <InfoBoxLoader />;
  }
  // @todo replace these variables
  const parentDAOAddress: string | undefined = undefined;
  const daoPermissionList: string[] = [safe.address, safe.address, safe.address, safe.address];

  return (
    <Box>
      <PageHeader
        title="Nodes"
        titleTestId="nodes-title"
      />
      {parentDAOAddress && <DAOInfoCard safeAddress={parentDAOAddress} />}

      <Flex mt="1rem">
        {parentDAOAddress && (
          <NodeLines
            isFirstChild
            hasMore
            extendHeight
          />
        )}
        <DAOInfoCard safeAddress={safe.address} />
      </Flex>

      {daoPermissionList.map((safeAddress, i, arr) => {
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
            <DAOInfoCard safeAddress={safeAddress} />
          </Flex>
        );
      })}
    </Box>
  );
}
