import { Flex } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceType } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';
import Divider from '../../ui/utils/Divider';
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
      {type === GovernanceType.AZORIUS_ERC20 ? (
        <ERC20TokenContainer />
      ) : type === GovernanceType.AZORIUS_ERC721 ? (
        <ERC721TokensContainer />
      ) : type === GovernanceType.MULTISIG ? (
        <SignersContainer />
      ) : null}
      <Divider
        mt={10}
        mb={10}
      />
      <ModulesContainer />
      <Divider
        mt={10}
        mb={10}
      />
      <MetadataContainer />
    </>
  );
}
