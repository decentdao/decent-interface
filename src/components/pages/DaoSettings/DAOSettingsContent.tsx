import { Flex, Hide, Show } from '@chakra-ui/react';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceType } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';
import { GeneralSettingsContainer } from './components/GeneralSettingsContainer';
import GovernanceContainer from './components/GovernanceContainer';
import MobileSettingsLinks from './components/MobileSettingsLinks';
import { ModulesContainer } from './components/ModulesContainer';
import PermissionsContainer from './components/PermissionsContainer';

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
    <>
      <Show below="md">
        <MobileSettingsLinks />
      </Show>
      <Hide below="md">
        <Flex
          flexDir="column"
          gap="3rem"
        >
          <GeneralSettingsContainer />
          <GovernanceContainer />
          {type !== GovernanceType.MULTISIG && <PermissionsContainer />}
          <ModulesContainer />
        </Flex>
      </Hide>
    </>
  );
}
