'use client';

import { Divider, Flex } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceSelectionType } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';
import ERC20TokenContainer from './components/ERC20Token';
import ERC721TokensContainer from './components/ERC721Token';
import MetadataContainer from './components/Metadata';
import { ModulesContainer } from './components/Modules';
import SignersContainer from './components/Signers';

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
        <ERC20TokenContainer />
      ) : type === GovernanceSelectionType.AZORIUS_ERC721 ? (
        <ERC721TokensContainer />
      ) : type === GovernanceSelectionType.MULTISIG ? (
        <SignersContainer />
      ) : null}
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
