import { Show } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { NavigationLinks } from './NavigationLinks';

function Navigation() {
  const {
    node: { daoAddress },
  } = useFractal();

  const showDAOLinks = !!daoAddress;
  return (
    <Show above="md">
      <NavigationLinks
        showDAOLinks={showDAOLinks}
        address={daoAddress}
      />
    </Show>
  );
}

export default Navigation;
