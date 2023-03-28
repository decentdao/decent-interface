import { Flex } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DAOInfoCard } from '../../../ui/cards/DAOInfoCard';
import { BarLoader } from '../../../ui/loaders/BarLoader';

export function InfoDAO() {
  const {
    node: {
      safe,
      nodeHierarchy: { parentAddress: parentDAOAddress, childNodes },
    },
    guardContracts,
    guard,
  } = useFractal();

  if (!safe?.address) {
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
      freezeData={guard}
      guardContracts={guardContracts}
    />
  );
}
