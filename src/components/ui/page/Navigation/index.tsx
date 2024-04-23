import { Flex, Show } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { NavigationLinks } from './NavigationLinks';

function Navigation() {
  const {
    node: { daoAddress },
  } = useFractal();

  const showDAOLinks = !!daoAddress;
  return (
    <Flex
      alignItems="center"
      direction="column"
      justifyContent="end"
      flexGrow={1}
    >
      <Show above="md">
        <NavigationLinks
          showDAOLinks={showDAOLinks}
          address={daoAddress}
        />
      </Show>
    </Flex>
  );
}

export default Navigation;
