'use client';

import { Divider, Flex } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceSelectionType } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';
import MetadataContainer from './components/Metadata';
import { ModulesContainer } from './components/Modules';
import SignersContainer from './components/Signers';
import { GovernanceTokenContainer } from './components/Token';

export function Settings() {
  const {
    node: { safe },
    governance: { type },
  } = useFractal();

  if (!safe) {
    return (
      <Flex
        h="8.5rem"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <BarLoader />
      </Flex>
    );
  }

  return (
    <>
      {type === GovernanceSelectionType.AZORIUS_ERC20 ? (
        <GovernanceTokenContainer />
      ) : (
        <SignersContainer />
      )}
      <Divider
        color="chocolate.700"
        mt={10}
        mb={10}
      />
      <ModulesContainer />
      <Divider
        color="chocolate.700"
        mt={10}
        mb={10}
      />
      <MetadataContainer />
    </>
  );
}
