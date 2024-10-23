import { Flex, Hide, Show } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { Card } from '../../ui/cards/Card';
import { BarLoader } from '../../ui/loaders/BarLoader';
import { GeneralSettingsContainer } from './components/GeneralSettingsContainer';
import GovernanceContainer from './components/GovernanceContainer';
import { ModulesContainer } from './components/ModulesContainer';

export function DAOSettingsContent() {
  const {
    node: { safe },
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
      <Show below="md">
        <Card>List of settings for mobile</Card>
      </Show>
      <Hide below="md">
        <Flex
          flexDir="column"
          gap="3rem"
        >
          <GeneralSettingsContainer />
          <GovernanceContainer />
          <ModulesContainer />
        </Flex>
      </Hide>
    </>
  );
}
