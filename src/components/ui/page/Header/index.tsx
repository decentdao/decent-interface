import { Flex, Show } from '@chakra-ui/react';
import AccountDisplay from '../../menus/AccountDisplay';
import { DAOSearch } from '../../menus/DAOSearch';
import { FavoritesMenu } from '../../menus/FavoritesMenu';

function Header() {
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
      pe="0.5rem"
      alignItems="center"
    >
      <Show above="md">
        <DAOSearch />
      </Show>
      <Flex
        h="full"
        w="full"
        justifyContent="flex-end"
      >
        <FavoritesMenu />
        <AccountDisplay />
      </Flex>
    </Flex>
  );
}

export default Header;
