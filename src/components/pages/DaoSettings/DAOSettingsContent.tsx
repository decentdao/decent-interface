import { Flex } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceType } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';
import { ERC20TokenContainer } from './components/ERC20TokenContainer';
import { ERC721TokensContainer } from './components/ERC721TokensContainer';
import { MetadataContainer } from './components/MetadataContainer';
import { ModulesContainer } from './components/ModulesContainer';
import { SignersContainer } from './components/Signers/SignersContainer';

export function DAOSettingsContent() {
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
    <Flex
      flexDir="column"
      gap="3rem"
    >
      {type === GovernanceType.AZORIUS_ERC20 ? (
        <ERC20TokenContainer />
      ) : type === GovernanceType.AZORIUS_ERC721 ? (
        <ERC721TokensContainer />
      ) : type === GovernanceType.MULTISIG ? (
        <SignersContainer />
      ) : null}
      <ModulesContainer />
      <MetadataContainer />
    </Flex>
  );
}
