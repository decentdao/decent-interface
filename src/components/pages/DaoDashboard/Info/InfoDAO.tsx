import { Flex } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAOInfoCard } from '../../../ui/cards/DAOInfoCard';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import { useFetchNodes } from '../../DaoHierarchy/useFetchNodes';

export function InfoDAO() {
  const {
    gnosis: { safe, freezeData, guardContracts, parentDAOAddress },
  } = useFractal();
  const { childNodes } = useFetchNodes(safe.address);
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
      parentSafeAddress={parentDAOAddress}
      safeAddress={safe.address}
      numberOfChildrenDAO={(childNodes ?? []).length}
      freezeData={freezeData}
      guardContracts={guardContracts}
    />
  );
}
