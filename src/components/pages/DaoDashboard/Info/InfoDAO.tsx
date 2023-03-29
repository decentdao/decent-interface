import { Flex } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DAOInfoCard } from '../../../ui/cards/DAOInfoCard';
import { BarLoader } from '../../../ui/loaders/BarLoader';

export function InfoDAO() {
  const {
    node: {
      daoAddress,
      nodeHierarchy: { parentAddress, childNodes },
    },
    guardContracts,
    guard,
  } = useFractal();

  if (!daoAddress) {
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
      parentAddress={parentAddress}
      safeAddress={daoAddress}
      numberOfChildrenDAO={(childNodes ?? []).length}
      freezeData={guard}
      guardContracts={guardContracts}
    />
  );
}
