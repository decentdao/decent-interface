import { Flex } from '@chakra-ui/react';
import { DAOInfoCard } from '../../../components/ui/cards/DAOInfoCard';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';

export function InfoDAO() {
  const {
    gnosis: { safe, freezeData, guardContracts },
  } = useFractal();

  // @todo replace mocked values
  const subDAOsWithPermissions = [];

  if (!safe.address) {
    return (
      <Flex
        minHeight="8.5rem"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <BarLoader />
      </Flex>
    );
  }

  return (
    <DAOInfoCard
      safeAddress={safe.address}
      numberOfChildrenDAO={subDAOsWithPermissions.length}
      freezeData={freezeData}
      guardContracts={guardContracts}
    />
  );
}
