'use client';

import { Divider, Flex } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceModuleType } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';
import { GovernanceTokenContainer, ModulesContainer } from './components';
import ManageSigners from './components/ManageSigners';

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
      {type === GovernanceModuleType.AZORIUS ? <GovernanceTokenContainer /> : <ManageSigners />}
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
    </>
  );
}
