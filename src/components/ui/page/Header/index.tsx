import { Flex, Show } from '@chakra-ui/react';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { DAOSearch } from '../../menus/DAOSearch';
import { FavoritesMenu } from '../../menus/FavoritesMenu';
import ClientOnly from '../../utils/ClientOnly';

function Header() {
  return (
    <ClientOnly>
      <Flex
        h="full"
        w="full"
        justifyContent="space-between"
        px="0.5rem"
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
    </ClientOnly>
  );
}

export default Header;
